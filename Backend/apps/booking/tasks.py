from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from apps.booking.models import Appointment
from shared.email import send_booking_reminder


@shared_task
def send_24hr_reminders():
    tomorrow = timezone.now().date() + timedelta(days=1)
    appointments = Appointment.objects.filter(
        date=tomorrow,
        status='confirmed',
    ).select_related('service').only(
        'id', 'clerk_user_id', 'date', 'time_slot', 'service__name'
    )

    for appt in appointments:
        from apps.users.models import UserProfile

        try:
            user = UserProfile.objects.only('email').get(clerk_user_id=appt.clerk_user_id)
            send_booking_reminder(
                user.email,
                appt.service.name,
                str(appt.date),
                str(appt.time_slot),
            )
        except UserProfile.DoesNotExist:
            continue

    return f'Reminders sent: {appointments.count()}'
