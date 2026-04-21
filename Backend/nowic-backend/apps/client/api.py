from decimal import Decimal
from typing import Optional

from django.db.models import Sum
from django.http import HttpRequest
from django.utils import timezone
from ninja import Query, Router

from apps.booking.models import Appointment
from apps.client.models import Invoice, ProjectClientAssignment, ProjectFile, ProjectUpdate
from apps.client.schemas import InvoiceOut, ProjectFileOut, ProjectUpdateOut
from apps.notifications.models import Notification
from apps.users.models import UserProfile
from shared.auth import clerk_auth, get_current_user
from shared.exceptions import NotFound, PermissionDenied

router = Router(tags=['Client'], auth=clerk_auth)


def _user_profile(request: HttpRequest) -> UserProfile:
    return get_current_user(request)


def _client_project_ids(profile: UserProfile):
    return ProjectClientAssignment.objects.filter(client=profile).values_list('project_id', flat=True)


@router.get('/dashboard/')
def client_dashboard(request: HttpRequest):
    profile = _user_profile(request)

    my_bookings = list(
        Appointment.objects.select_related('service').only(
            'id', 'date', 'time_slot', 'status', 'booked_at', 'service__name', 'clerk_user_id'
        ).filter(
            clerk_user_id=profile.clerk_user_id,
            date__gte=timezone.localdate(),
        ).order_by('date', 'time_slot').values(
            'id', 'date', 'time_slot', 'status', 'booked_at', 'service__name'
        )[:5]
    )

    project_ids = _client_project_ids(profile)
    my_projects = list(
        ProjectClientAssignment.objects.select_related('project').only(
            'project__id', 'project__name', 'project__progress', 'project__status', 'project__deadline', 'client_id'
        ).filter(client=profile).values(
            'project__id', 'project__name', 'project__progress', 'project__status', 'project__deadline'
        )
    )

    invoices_qs = Invoice.objects.select_related('project').only(
        'id', 'project_id', 'invoice_number', 'amount', 'paid_amount', 'status', 'due_date', 'notes', 'created_at', 'paid_at'
    ).filter(project_id__in=project_ids)

    unread_notifications = list(
        Notification.objects.only('id', 'notification_type', 'title', 'message', 'data', 'is_read', 'created_at').filter(
            recipient_clerk_id=profile.clerk_user_id,
            is_read=False,
        ).values('id', 'notification_type', 'title', 'message', 'data', 'is_read', 'created_at')[:5]
    )

    total_due = Decimal('0.00')
    for inv in invoices_qs.exclude(status='paid'):
        total_due += inv.remaining_amount

    recent = [
        {
            'id': inv.id,
            'project_id': inv.project_id,
            'invoice_number': inv.invoice_number,
            'amount': str(inv.amount),
            'paid_amount': str(inv.paid_amount),
            'remaining_amount': str(inv.remaining_amount),
            'status': inv.status,
            'due_date': inv.due_date,
            'notes': inv.notes,
            'created_at': inv.created_at,
            'paid_at': inv.paid_at,
        }
        for inv in invoices_qs[:3]
    ]

    return {
        'success': True,
        'data': {
            'profile': {
                'full_name': profile.full_name,
                'email': profile.email,
                'role': profile.role,
            },
            'my_bookings': my_bookings,
            'my_projects': my_projects,
            'my_invoices': {
                'unpaid_count': invoices_qs.exclude(status='paid').count(),
                'total_due': str(total_due),
                'recent': recent,
            },
            'notifications': unread_notifications,
        },
    }


@router.get('/projects/')
def client_projects(request: HttpRequest):
    profile = _user_profile(request)
    data = list(
        ProjectClientAssignment.objects.select_related('project').only(
            'project__id', 'project__name', 'project__progress', 'project__status', 'project__deadline', 'client_id'
        ).filter(client=profile).values(
            'project__id', 'project__name', 'project__progress', 'project__status', 'project__deadline'
        )
    )
    return {'success': True, 'data': data}


@router.get('/projects/{project_id}/updates/')
def client_project_updates(request: HttpRequest, project_id: int):
    profile = _user_profile(request)
    assignment_exists = ProjectClientAssignment.objects.filter(project_id=project_id, client=profile).exists()
    if not assignment_exists:
        raise NotFound(f'Project #{project_id} not found')

    updates = ProjectUpdate.objects.select_related('project').only(
        'id', 'project_id', 'title', 'description', 'progress', 'posted_by', 'posted_at', 'project__id'
    ).filter(project_id=project_id)
    return {
        'success': True,
        'data': [ProjectUpdateOut.from_orm(u).dict() for u in updates],
    }


@router.get('/projects/{project_id}/files/')
def client_project_files(request: HttpRequest, project_id: int):
    profile = _user_profile(request)
    assignment_exists = ProjectClientAssignment.objects.filter(project_id=project_id, client=profile).exists()
    if not assignment_exists:
        raise NotFound(f'Project #{project_id} not found')

    files = ProjectFile.objects.select_related('project').only(
        'id', 'project_id', 'file_url', 'file_name', 'file_type', 'uploaded_by', 'uploaded_at', 'project__id'
    ).filter(project_id=project_id)
    return {
        'success': True,
        'data': [ProjectFileOut.from_orm(f).dict() for f in files],
    }


@router.get('/invoices/')
def client_invoices(request: HttpRequest, status: Optional[str] = Query(default=None)):
    profile = _user_profile(request)
    project_ids = _client_project_ids(profile)

    invoices = Invoice.objects.select_related('project').only(
        'id', 'project_id', 'invoice_number', 'amount', 'paid_amount', 'status', 'due_date', 'notes', 'created_at', 'paid_at',
        'project__id'
    ).filter(project_id__in=project_ids)
    if status:
        invoices = invoices.filter(status=status)

    return {
        'success': True,
        'data': [InvoiceOut.from_orm(inv).dict() for inv in invoices],
    }


@router.get('/invoices/{invoice_id}/')
def client_invoice_detail(request: HttpRequest, invoice_id: int):
    profile = _user_profile(request)
    project_ids = _client_project_ids(profile)

    try:
        invoice = Invoice.objects.select_related('project').only(
            'id', 'project_id', 'invoice_number', 'amount', 'paid_amount', 'status', 'due_date', 'notes', 'created_at', 'paid_at',
            'project__id'
        ).get(id=invoice_id, project_id__in=project_ids)
    except Invoice.DoesNotExist:
        raise NotFound(f'Invoice #{invoice_id} not found')

    return {'success': True, 'data': InvoiceOut.from_orm(invoice).dict()}


@router.get('/bookings/')
def client_bookings(request: HttpRequest, status: Optional[str] = Query(default=None)):
    profile = _user_profile(request)

    bookings = Appointment.objects.select_related('service').only(
        'id', 'clerk_user_id', 'date', 'time_slot', 'status', 'cancellation_reason', 'booked_at', 'service__name'
    ).filter(clerk_user_id=profile.clerk_user_id)
    if status:
        bookings = bookings.filter(status=status)

    data = [
        {
            'id': b.id,
            'service_name': b.service.name,
            'date': b.date,
            'time_slot': b.time_slot,
            'status': b.status,
            'cancellation_reason': b.cancellation_reason,
            'booked_at': b.booked_at,
        }
        for b in bookings
    ]
    return {'success': True, 'data': data}
