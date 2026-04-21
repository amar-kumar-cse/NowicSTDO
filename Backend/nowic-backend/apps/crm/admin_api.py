"""
apps/crm/admin_api.py

Admin dashboard and management endpoints.
"""
from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.db.models import F, Q, Sum
from django.http import HttpRequest
from django.utils import timezone
from ninja import Query, Router, Schema

from apps.booking.models import Appointment
from apps.client.models import Invoice, ProjectClientAssignment, ProjectFile, ProjectUpdate
from apps.client.schemas import InvoiceCreateIn, InvoiceUpdateIn, ProjectFileIn, ProjectUpdateIn
from apps.crm.models import Lead, Project
from apps.notifications.utils import create_notification
from apps.public.models import ContactSubmission, PortfolioProject, ServiceOffering, SiteContent
from apps.public.schemas import SiteContentOut
from apps.users.models import UserProfile
from apps.audit.utils import log_action
from shared.audit import AuditAction
from shared.auth import clerk_auth, get_admin_user
from shared.email import send_invoice_email, send_invoice_overdue, send_project_update_email
from shared.exceptions import NotFound, PermissionDenied
from shared.pagination import paginate

router = Router(tags=['Admin'], auth=clerk_auth)


def _admin(request: HttpRequest) -> UserProfile:
    return get_admin_user(request)


class UserRoleUpdateIn(Schema):
    role: str


class SiteContentUpsertIn(Schema):
    data: object


@router.get('/dashboard/')
def admin_dashboard(request: HttpRequest):
    admin = _admin(request)

    now = timezone.now()
    today = timezone.localdate()
    week_start = now - timedelta(days=7)

    total_revenue = Project.objects.filter(status='delivered').aggregate(total=Sum('cost'))['total'] or Decimal('0.00')

    recent_leads = list(
        Lead.objects.filter(is_active=True).only(
            'id', 'company_name', 'founder_name', 'email', 'phone', 'status', 'source', 'created_at'
        ).order_by('-created_at').values(
            'id', 'company_name', 'founder_name', 'email', 'phone', 'status', 'source', 'created_at'
        )[:5]
    )

    recent_bookings = list(
        Appointment.objects.select_related('service').only(
            'id', 'clerk_user_id', 'date', 'time_slot', 'status', 'booked_at', 'service__name'
        ).order_by('-booked_at').annotate(service_name=F('service__name')).values(
            'id', 'clerk_user_id', 'date', 'time_slot', 'status', 'booked_at', 'service_name'
        )[:5]
    )

    recent_contacts = list(
        ContactSubmission.objects.select_related('service_interest').only(
            'id', 'name', 'email', 'message', 'priority', 'submitted_at', 'status',
            'service_interest__name', 'service_interest__slug'
        ).filter(status='new').order_by('-submitted_at').annotate(
            service_name=F('service_interest__name'),
            service_slug=F('service_interest__slug'),
        ).values(
            'id', 'name', 'email', 'message', 'priority', 'submitted_at', 'status', 'service_name', 'service_slug'
        )[:5]
    )

    return {
        'success': True,
        'data': {
            'admin': {'full_name': admin.full_name, 'email': admin.email, 'role': admin.role},
            'summary': {
                'total_leads': Lead.objects.filter(is_active=True).count(),
                'new_leads_today': Lead.objects.filter(is_active=True, created_at__date=today).count(),
                'total_bookings': Appointment.objects.count(),
                'pending_bookings': Appointment.objects.filter(status='pending').count(),
                'unread_contacts': ContactSubmission.objects.filter(status='new').count(),
                'active_services': ServiceOffering.objects.filter(is_active=True).count(),
                'portfolio_count': PortfolioProject.objects.count(),
                'total_revenue': str(total_revenue),
            },
            'recent_leads': recent_leads,
            'recent_bookings': recent_bookings,
            'recent_contacts': recent_contacts,
            'quick_stats': {
                'leads_this_week': Lead.objects.filter(is_active=True, created_at__gte=week_start).count(),
                'bookings_this_week': Appointment.objects.filter(booked_at__gte=week_start).count(),
                'contacts_this_week': ContactSubmission.objects.filter(submitted_at__gte=week_start).count(),
            },
        },
    }


@router.get('/site-content/')
def list_site_content(request: HttpRequest):
    _admin(request)
    rows = SiteContent.objects.only('section', 'data', 'updated_at').order_by('section')
    return {
        'success': True,
        'data': [SiteContentOut.from_orm(row).dict() for row in rows],
    }


@router.get('/site-content/{section}/')
def get_site_content(request: HttpRequest, section: str):
    _admin(request)
    try:
        row = SiteContent.objects.only('section', 'data', 'updated_at').get(section=section)
    except SiteContent.DoesNotExist:
        raise NotFound(f"Site content '{section}' not found")

    return {
        'success': True,
        'data': SiteContentOut.from_orm(row).dict(),
    }


@router.put('/site-content/{section}/')
@router.patch('/site-content/{section}/')
def upsert_site_content(request: HttpRequest, section: str, payload: SiteContentUpsertIn):
    _admin(request)
    row, _ = SiteContent.objects.update_or_create(section=section, defaults={'data': payload.data})
    return {
        'success': True,
        'data': SiteContentOut.from_orm(row).dict(),
    }


@router.get('/me/')
def admin_me(request: HttpRequest):
    admin = _admin(request)
    return {
        'success': True,
        'data': {
            'clerk_user_id': admin.clerk_user_id,
            'full_name': admin.full_name,
            'email': admin.email,
            'role': admin.role,
            'created_at': admin.created_at,
        },
    }


@router.get('/users/')
def list_users(
    request: HttpRequest,
    role: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1),
    page_size: int = Query(default=10),
):
    _admin(request)

    qs = UserProfile.objects.only('clerk_user_id', 'full_name', 'email', 'role', 'is_active', 'created_at').order_by('-created_at')
    if role in {'admin', 'client'}:
        qs = qs.filter(role=role)
    if search:
        qs = qs.filter(Q(email__icontains=search) | Q(full_name__icontains=search))

    return paginate(
        qs,
        page=page,
        page_size=page_size,
        fields=['clerk_user_id', 'full_name', 'email', 'role', 'is_active', 'created_at'],
    )


@router.patch('/users/{clerk_user_id}/')
def update_user_role(request: HttpRequest, clerk_user_id: str, payload: UserRoleUpdateIn):
    admin = _admin(request)

    if payload.role not in {'admin', 'client'}:
        raise PermissionDenied('Invalid role')
    if admin.clerk_user_id == clerk_user_id:
        raise PermissionDenied('You cannot change your own role')

    try:
        user = UserProfile.objects.only('clerk_user_id', 'email', 'role').get(clerk_user_id=clerk_user_id)
    except UserProfile.DoesNotExist:
        raise NotFound(f"User '{clerk_user_id}' not found")

    old_role = user.role
    user.role = payload.role
    user.save(update_fields=['role'])

    log_action(
        actor_clerk_id=admin.clerk_user_id,
        actor_email=admin.email,
        action=AuditAction.USER_ROLE_CHANGED,
        resource_type='user',
        resource_id=user.clerk_user_id,
        old_value={'role': old_role},
        new_value={'role': user.role},
        ip=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )

    return {'success': True, 'message': 'Role updated'}


@router.get('/search/')
def global_search(request: HttpRequest, q: str = Query(...)):
    _admin(request)

    leads = list(
        Lead.objects.filter(is_active=True).filter(
            Q(company_name__icontains=q) | Q(founder_name__icontains=q) | Q(email__icontains=q)
        ).only('id', 'company_name', 'founder_name', 'email', 'status').values(
            'id', 'company_name', 'founder_name', 'email', 'status'
        )[:5]
    )

    submissions = list(
        ContactSubmission.objects.select_related('service_interest').filter(
            Q(name__icontains=q) | Q(email__icontains=q) | Q(message__icontains=q)
        ).only(
            'id', 'name', 'email', 'status', 'submitted_at', 'service_interest__name'
        ).annotate(service_name=F('service_interest__name')).values(
            'id', 'name', 'email', 'status', 'submitted_at', 'service_name'
        )[:5]
    )

    portfolio = list(
        PortfolioProject.objects.filter(
            Q(title__icontains=q) | Q(description__icontains=q) | Q(category__icontains=q)
        ).only('id', 'title', 'slug', 'category').values('id', 'title', 'slug', 'category')[:5]
    )

    users = list(
        UserProfile.objects.filter(Q(email__icontains=q) | Q(full_name__icontains=q)).only(
            'clerk_user_id', 'email', 'full_name', 'role'
        ).values('clerk_user_id', 'email', 'full_name', 'role')[:5]
    )

    total = len(leads) + len(submissions) + len(portfolio) + len(users)

    return {
        'success': True,
        'data': {
            'leads': leads,
            'submissions': submissions,
            'portfolio': portfolio,
            'users': users,
            'total_results': total,
        },
    }


@router.post('/projects/{project_id}/updates/')
def post_project_update(request: HttpRequest, project_id: int, payload: ProjectUpdateIn):
    admin = _admin(request)
    try:
        project = Project.objects.only('id', 'name').get(id=project_id)
    except Project.DoesNotExist:
        raise NotFound(f'Project #{project_id} not found')

    update = ProjectUpdate.objects.create(
        project=project,
        title=payload.title,
        description=payload.description,
        progress=max(0, min(100, payload.progress)),
        posted_by=admin.clerk_user_id,
    )

    assignment = ProjectClientAssignment.objects.select_related('client').only(
        'client__clerk_user_id', 'client__email', 'client__full_name', 'project_id'
    ).filter(project=project).first()

    if assignment:
        create_notification(
            assignment.client.clerk_user_id,
            'project_update',
            f'Project Update: {project.name}',
            update.title,
            {'project_id': project.id, 'update_id': update.id},
        )
        send_project_update_email(
            assignment.client.email,
            assignment.client.full_name or 'Client',
            project.name,
            update.progress,
            update.title,
            update.description,
        )

    return {'success': True, 'data': {'id': update.id}}


@router.post('/projects/{project_id}/files/')
def upload_project_file(request: HttpRequest, project_id: int, payload: ProjectFileIn):
    _admin(request)
    try:
        project = Project.objects.only('id', 'name').get(id=project_id)
    except Project.DoesNotExist:
        raise NotFound(f'Project #{project_id} not found')

    file_obj = ProjectFile.objects.create(
        project=project,
        file_url=payload.file_url,
        file_name=payload.file_name,
        file_type=payload.file_type,
        uploaded_by=request.auth,
    )

    assignment = ProjectClientAssignment.objects.select_related('client').only(
        'client__clerk_user_id', 'project_id'
    ).filter(project=project).first()
    if assignment:
        create_notification(
            assignment.client.clerk_user_id,
            'project_file',
            f'New file shared for {project.name}',
            payload.file_name,
            {'project_id': project.id, 'file_id': file_obj.id},
        )

    return {'success': True, 'data': {'id': file_obj.id}}


def _next_invoice_number() -> str:
    year = timezone.now().year
    prefix = f'INV-{year}-'
    latest = Invoice.objects.only('invoice_number').filter(invoice_number__startswith=prefix).order_by('-invoice_number').first()
    if not latest:
        seq = 1
    else:
        try:
            seq = int(latest.invoice_number.split('-')[-1]) + 1
        except (ValueError, IndexError):
            seq = 1
    return f'{prefix}{seq:04d}'


@router.post('/invoices/')
def create_invoice(request: HttpRequest, payload: InvoiceCreateIn):
    _admin(request)
    try:
        project = Project.objects.only('id', 'name').get(id=payload.project_id)
    except Project.DoesNotExist:
        raise NotFound(f'Project #{payload.project_id} not found')

    invoice = Invoice.objects.create(
        project=project,
        invoice_number=_next_invoice_number(),
        amount=payload.amount,
        due_date=payload.due_date,
        notes=payload.notes or '',
    )

    assignment = ProjectClientAssignment.objects.select_related('client').only(
        'client__clerk_user_id', 'client__email', 'client__full_name', 'project_id'
    ).filter(project=project).first()

    if assignment:
        create_notification(
            assignment.client.clerk_user_id,
            'invoice_created',
            f'New Invoice #{invoice.invoice_number}',
            f'Invoice for {project.name} has been generated',
            {'invoice_id': invoice.id, 'project_id': project.id},
        )
        send_invoice_email(
            assignment.client.email,
            assignment.client.full_name or 'Client',
            invoice.invoice_number,
            str(invoice.amount),
            str(invoice.due_date),
            project.name,
            invoice.notes,
        )

    return {'success': True, 'data': {'id': invoice.id, 'invoice_number': invoice.invoice_number}}


@router.patch('/invoices/{invoice_id}/')
def update_invoice(request: HttpRequest, invoice_id: int, payload: InvoiceUpdateIn):
    _admin(request)
    try:
        invoice = Invoice.objects.select_related('project').only(
            'id', 'project_id', 'invoice_number', 'amount', 'paid_amount', 'status', 'due_date', 'notes', 'paid_at',
            'project__name'
        ).get(id=invoice_id)
    except Invoice.DoesNotExist:
        raise NotFound(f'Invoice #{invoice_id} not found')

    if payload.paid_amount is not None:
        invoice.paid_amount = payload.paid_amount
    if payload.status is not None:
        invoice.status = payload.status
    if payload.notes is not None:
        invoice.notes = payload.notes

    if invoice.status == 'paid':
        invoice.paid_at = timezone.now()

    invoice.save()

    assignment = ProjectClientAssignment.objects.select_related('client').only(
        'client__email', 'client__full_name', 'project_id'
    ).filter(project=invoice.project).first()

    if assignment and invoice.status == 'overdue':
        days_overdue = max(0, (timezone.localdate() - invoice.due_date).days)
        send_invoice_overdue(
            assignment.client.email,
            assignment.client.full_name or 'Client',
            invoice.invoice_number,
            str(invoice.remaining_amount),
            days_overdue,
        )

    return {'success': True, 'data': {'id': invoice.id, 'status': invoice.status}}


@router.get('/invoices/')
def list_invoices(
    request: HttpRequest,
    status: Optional[str] = Query(default=None),
    overdue: Optional[bool] = Query(default=None),
):
    _admin(request)

    qs = Invoice.objects.select_related('project').only(
        'id', 'project_id', 'invoice_number', 'amount', 'paid_amount', 'status', 'due_date', 'notes', 'created_at', 'paid_at',
        'project__name'
    )

    if status:
        qs = qs.filter(status=status)
    if overdue:
        qs = qs.filter(status='overdue')

    data = []
    for invoice in qs:
        assignment = ProjectClientAssignment.objects.select_related('client').only(
            'client__email', 'client__full_name', 'project_id'
        ).filter(project=invoice.project).first()

        data.append(
            {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'amount': str(invoice.amount),
                'paid_amount': str(invoice.paid_amount),
                'remaining_amount': str(invoice.remaining_amount),
                'status': invoice.status,
                'due_date': invoice.due_date,
                'notes': invoice.notes,
                'created_at': invoice.created_at,
                'paid_at': invoice.paid_at,
                'project': {'id': invoice.project_id, 'name': invoice.project.name},
                'client': {
                    'full_name': assignment.client.full_name if assignment else '',
                    'email': assignment.client.email if assignment else '',
                },
            }
        )

    return {'success': True, 'data': data}
