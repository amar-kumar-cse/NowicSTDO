"""
apps/booking/api.py

Booking system endpoints.
Public:     GET /services/, GET /slots/
Protected:  POST /book/, GET /mine/, POST /cancel/{id}/
"""
import logging
from typing import Optional
from datetime import date as date_type, datetime

from django.http import HttpRequest
from django.db import DatabaseError, IntegrityError, transaction
from django.utils import timezone
from ninja import Router, Query

from apps.booking.models import BookingService, Appointment
from apps.booking.schemas import (
    BookingServiceOut,
    AppointmentIn,
    AppointmentOut,
    CancelIn,
)
from shared.auth import clerk_auth, get_current_user
from shared.exceptions import NotFound, ConflictError, RateLimited
from shared.ratelimit import booking_limiter, get_client_ip
from shared.email import send_booking_confirmation, send_booking_admin_notification
from shared.sanitize import sanitize_string
from shared.audit import AuditAction
from apps.audit.utils import log_action
from apps.notifications.utils import notify_all_admins

logger = logging.getLogger(__name__)

router = Router(tags=["Booking"])

ALL_SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]


# ─── Public ──────────────────────────────────────────────────────────────────

@router.get("/services/", auth=None)
def list_booking_services(request: HttpRequest) -> dict:
    """Return all active booking services."""
    services = BookingService.objects.filter(is_active=True)
    data = [BookingServiceOut.from_orm(s).dict() for s in services]
    return {"success": True, "data": data}


@router.get("/slots/", auth=None)
def get_available_slots(
    request: HttpRequest,
    date: date_type = Query(...),
    service_id: int = Query(...),
) -> dict:
    """
    Return available time slots for a given date.
    Booked slots (any status except cancelled) are excluded.
    Note: Timezone issues may occur if the frontend does not pass
    the desired date relative to the business's timezone.
    """
    service_exists = BookingService.objects.filter(id=service_id, is_active=True).exists()
    if not service_exists:
        raise NotFound(f"Booking service #{service_id} not found")

    booked = set(
        Appointment.objects.filter(date=date)
        .filter(service_id=service_id)
        .exclude(status="cancelled")
        .values_list("time_slot", flat=True)
    )
    # Normalise booked times to "HH:MM" strings for comparison
    booked_strs = {t.strftime("%H:%M") for t in booked}
    available = [slot for slot in ALL_SLOTS if slot not in booked_strs]

    # Past-date fix
    local_now = timezone.localtime(timezone.now())
    today = local_now.date()
    if date < today:
        available = []
    elif date == today:
        current_time = local_now.time()
        available = [s for s in available if datetime.strptime(s, "%H:%M").time() > current_time]

    return {
        "success": True,
        "data": {
            "date": str(date),
            "available": available,
        },
    }


# ─── Protected (Clerk required) ───────────────────────────────────────────────

@router.post("/book/", auth=clerk_auth)
def book_appointment(request: HttpRequest, payload: AppointmentIn) -> dict:
    """
    Book a new appointment.

    Steps:
    1. Extract clerk_user_id from JWT
    2. Check slot availability → ConflictError if taken
    3. Validate that booking date/time is not in the past
    4. Create Appointment
    5. Look up user email → send confirmation email
    """
    clerk_user_id = request.auth

    # Rate limiting by authenticated user
    rl = booking_limiter.check(clerk_user_id)
    if not rl["allowed"]:
        raise RateLimited(retry_after=rl["reset_seconds"])
    
    # 1. Validate service exists
    try:
        service = BookingService.objects.get(id=payload.service_id, is_active=True)
    except BookingService.DoesNotExist:
        raise NotFound(f"Booking service #{payload.service_id} not found")

    # 2. Add past-date validation
    local_now = timezone.localtime(timezone.now())
    today = local_now.date()
    if payload.date < today:
        raise ConflictError("Cannot book a slot in the past")
        
    if payload.date == today:
        current_time = local_now.time()
        slot_time_str = payload.time_slot.strftime("%H:%M")
        slot_time = datetime.strptime(slot_time_str, "%H:%M").time()
        if slot_time <= current_time:
            raise ConflictError("This time slot has already passed today")

    # 3. Check slot availability
    slot_taken = Appointment.objects.filter(
        date=payload.date, time_slot=payload.time_slot, service=service
    ).exclude(status="cancelled").exists()
    if slot_taken:
        raise ConflictError("This time slot is already booked. Please choose another.")

    # 4. Create appointment
    try:
        with transaction.atomic():
            appointment = Appointment.objects.create(
                clerk_user_id=clerk_user_id,
                service=service,
                date=payload.date,
                time_slot=payload.time_slot,
                email=payload.email,
                phone=payload.phone,
                status="confirmed",
            )
    except IntegrityError:
        raise ConflictError("This time slot is already booked. Please choose another.")

    # 5. Send confirmation email (best-effort)
    profile = None
    try:
        from apps.users.models import UserProfile
        profile = UserProfile.objects.filter(clerk_user_id=clerk_user_id).first()
        client_name = (profile.full_name if profile and profile.full_name else '') or payload.email
        if profile and profile.email:
            send_booking_confirmation(
                email=profile.email,
                service_name=service.name,
                date=str(payload.date),
                time_slot=payload.time_slot.strftime("%H:%M"),
            )
        # Notify Admin via Email
        send_booking_admin_notification(
            client_name=client_name,
            client_email=payload.email,
            service_name=service.name,
            date=str(payload.date),
            time_slot=payload.time_slot.strftime("%H:%M"),
            phone=payload.phone or ''
        )
    except DatabaseError as exc:
        logger.warning("Could not send booking email notifications: %s", exc)

    notify_all_admins(
        'new_booking',
        'New Booking',
        f'Booking for {service.name} on {payload.date}',
        {'appointment_id': appointment.id},
    )

    # Webhook Notifications
    try:
        from shared.webhooks import notify_new_booking
        client_name = (profile.full_name if profile and profile.full_name else '') or payload.email
        notify_new_booking(
            name=client_name,
            email=payload.email,
            service_name=service.name,
            date=str(payload.date),
            time_slot=payload.time_slot.strftime("%H:%M") if hasattr(payload.time_slot, 'strftime') else str(payload.time_slot),
            phone=payload.phone or ''
        )
    except Exception as e:
        logger.error("Failed to trigger booking webhooks: %s", e)

    log_action(
        actor_clerk_id=clerk_user_id,
        actor_email=profile.email if profile else '',
        action=AuditAction.BOOKING_CREATED,
        resource_type='appointment',
        resource_id=appointment.id,
        old_value=None,
        new_value={
            'service_id': service.id,
            'date': str(payload.date),
            'time_slot': str(payload.time_slot),
            'status': 'confirmed',
        },
        ip=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )

    return {
        "success": True,
        "data": AppointmentOut.from_orm(appointment).dict(),
    }


@router.get("/mine/", auth=clerk_auth)
def list_my_appointments(
    request: HttpRequest,
    status: Optional[str] = Query(default=None),
) -> dict:
    """Return all appointments belonging to the authenticated user."""
    clerk_user_id = request.auth
    qs = Appointment.objects.filter(clerk_user_id=clerk_user_id).select_related("service")
    if status:
        qs = qs.filter(status=status)
    data = [AppointmentOut.from_orm(a).dict() for a in qs]
    return {"success": True, "data": data}


@router.post("/cancel/{appointment_id}/", auth=clerk_auth)
def cancel_appointment(
    request: HttpRequest, appointment_id: int, payload: CancelIn
) -> dict:
    """
    Cancel a booking.
    - Must belong to the authenticated user.
    - Cannot cancel a past booking.
    """
    clerk_user_id = request.auth

    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        raise NotFound(f"Appointment #{appointment_id} not found")

    # Ownership check
    if appointment.clerk_user_id != clerk_user_id:
        raise NotFound(f"Appointment #{appointment_id} not found")

    # Past-date check (use local calendar date — TIME_ZONE is Asia/Kolkata,
    # while timezone.now() is UTC and can be a day behind around midnight)
    today = timezone.localdate()
    if appointment.date < today:
        raise ConflictError("Cannot cancel a past booking")

    if appointment.status == "cancelled":
        raise ConflictError("This appointment is already cancelled")

    appointment.status = "cancelled"
    appointment.cancellation_reason = sanitize_string(payload.reason or "")
    appointment.save(update_fields=["status", "cancellation_reason"])

    notify_all_admins(
        'booking_cancelled',
        'Booking Cancelled',
        f'Appointment #{appointment.id} was cancelled',
        {'reason': appointment.cancellation_reason},
    )

    log_action(
        actor_clerk_id=clerk_user_id,
        action=AuditAction.BOOKING_CANCELLED,
        resource_type='appointment',
        resource_id=appointment.id,
        old_value={'status': 'confirmed'},
        new_value={'status': 'cancelled', 'reason': appointment.cancellation_reason},
        ip=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )

    return {"success": True, "message": "Booking cancelled"}
