"""
apps/crm/api.py

Admin-only CRM endpoints.
Manages leads, projects, contact submissions, analytics, and automation workflows.
"""
import logging
from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.db.models import Count, Q, Sum
from django.http import HttpRequest
from django.utils import timezone
from ninja import Query, Router, Schema

from apps.crm.models import Lead, Project
from apps.crm.schemas import LeadIn, LeadOut, LeadUpdate, ProjectOut, ProjectStatusUpdate
from apps.public.models import ContactSubmission
from apps.public.schemas import ContactAdminOut
from apps.notifications.utils import notify_all_admins
from apps.audit.utils import log_action
from shared.audit import AuditAction
from shared.auth import clerk_auth, get_admin_user
from shared.email import send_contact_reply
from shared.exceptions import NotFound
from shared.pagination import paginate
from shared.sanitize import sanitize_email, sanitize_string
from shared.search import search_leads, search_submissions

logger = logging.getLogger(__name__)

router = Router(tags=['CRM'], auth=clerk_auth)


def _admin(request: HttpRequest):
    return get_admin_user(request)


class SubmissionUpdateIn(Schema):
    status: Optional[str] = None
    priority: Optional[str] = None
    reply_note: Optional[str] = None


class BulkLeadActionIn(Schema):
    lead_ids: list[int]
    action: str
    email_subject: Optional[str] = None
    email_body: Optional[str] = None


@router.get('/leads/')
def list_leads(
    request: HttpRequest,
    status: Optional[str] = Query(default=None),
    source: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1),
    page_size: int = Query(default=10),
) -> dict:
    _admin(request)
    qs = Lead.objects.filter(is_active=True).only(
        'id', 'company_name', 'founder_name', 'email', 'phone', 'source', 'status', 'notes', 'is_active', 'created_at', 'updated_at'
    )
    if status:
        qs = qs.filter(status=status)
    if source:
        qs = qs.filter(source=source)
    if search:
        qs = search_leads(search, qs)

    return paginate(qs, page=page, page_size=page_size, serializer=lambda lead: LeadOut.from_orm(lead).dict())


@router.post('/leads/')
def create_lead(request: HttpRequest, payload: LeadIn) -> dict:
    admin = _admin(request)
    data = payload.dict()
    data['company_name'] = sanitize_string(data.get('company_name', ''))
    data['founder_name'] = sanitize_string(data.get('founder_name', ''))
    data['email'] = sanitize_email(data.get('email', ''))
    if 'notes' in data and data['notes']:
        data['notes'] = sanitize_string(data['notes'])

    lead = Lead.objects.create(**data)

    notify_all_admins(
        'new_lead',
        'New Lead Added',
        f"{lead.company_name} added to CRM",
        {'lead_id': lead.id},
    )

    log_action(
        actor_clerk_id=admin.clerk_user_id,
        actor_email=admin.email,
        action=AuditAction.LEAD_CREATED,
        resource_type='lead',
        resource_id=lead.id,
        new_value=LeadOut.from_orm(lead).model_dump(mode='json'),
        ip=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )

    return {'success': True, 'data': LeadOut.from_orm(lead).dict()}


@router.get('/leads/{lead_id}/')
def get_lead(request: HttpRequest, lead_id: int) -> dict:
    _admin(request)
    try:
        lead = Lead.objects.only(
            'id', 'company_name', 'founder_name', 'email', 'phone', 'source', 'status', 'notes', 'is_active', 'created_at', 'updated_at'
        ).get(id=lead_id, is_active=True)
    except Lead.DoesNotExist:
        raise NotFound(f'Lead #{lead_id} not found')
    return {'success': True, 'data': LeadOut.from_orm(lead).dict()}


@router.patch('/leads/{lead_id}/')
def update_lead(request: HttpRequest, lead_id: int, payload: LeadUpdate) -> dict:
    admin = _admin(request)
    try:
        lead = Lead.objects.only(
            'id', 'company_name', 'founder_name', 'email', 'phone', 'source', 'status', 'notes', 'is_active', 'created_at', 'updated_at'
        ).get(id=lead_id, is_active=True)
    except Lead.DoesNotExist:
        raise NotFound(f'Lead #{lead_id} not found')

    old_data = LeadOut.from_orm(lead).model_dump(mode='json')
    previous_status = lead.status

    update_data = payload.dict(exclude_none=True)
    if 'company_name' in update_data:
        update_data['company_name'] = sanitize_string(update_data['company_name'])
    if 'founder_name' in update_data:
        update_data['founder_name'] = sanitize_string(update_data['founder_name'])
    if 'email' in update_data:
        update_data['email'] = sanitize_email(update_data['email'])
    if 'notes' in update_data and update_data['notes'] is not None:
        update_data['notes'] = sanitize_string(update_data['notes'])

    for field, value in update_data.items():
        setattr(lead, field, value)
    lead.save()

    if previous_status != lead.status:
        log_action(
            actor_clerk_id=admin.clerk_user_id,
            actor_email=admin.email,
            action=AuditAction.LEAD_STATUS_CHANGED,
            resource_type='lead',
            resource_id=lead.id,
            old_value={'status': previous_status},
            new_value={'status': lead.status},
            ip=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

    if previous_status != 'won' and lead.status == 'won':
        notify_all_admins(
            'lead_won',
            'Lead Won!',
            f'{lead.company_name} converted to client',
            {'lead_id': lead.id, 'value': str(getattr(lead, 'project_cost', Decimal('0.00')))},
        )

    log_action(
        actor_clerk_id=admin.clerk_user_id,
        actor_email=admin.email,
        action=AuditAction.LEAD_UPDATED,
        resource_type='lead',
        resource_id=lead.id,
        old_value=old_data,
        new_value=LeadOut.from_orm(lead).model_dump(mode='json'),
        ip=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )

    return {'success': True, 'data': LeadOut.from_orm(lead).dict()}


@router.delete('/leads/{lead_id}/')
def delete_lead(request: HttpRequest, lead_id: int) -> dict:
    admin = _admin(request)
    try:
        lead = Lead.objects.only(
            'id', 'company_name', 'founder_name', 'email', 'phone', 'source', 'status', 'notes', 'is_active', 'created_at', 'updated_at'
        ).get(id=lead_id, is_active=True)
    except Lead.DoesNotExist:
        raise NotFound(f'Lead #{lead_id} not found')

    old_data = LeadOut.from_orm(lead).model_dump(mode='json')
    lead.is_active = False
    lead.save(update_fields=['is_active'])

    log_action(
        actor_clerk_id=admin.clerk_user_id,
        actor_email=admin.email,
        action=AuditAction.LEAD_DELETED,
        resource_type='lead',
        resource_id=lead.id,
        old_value=old_data,
        new_value={'is_active': False},
        ip=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )

    return {'success': True, 'message': f'Lead #{lead_id} removed'}


@router.post('/leads/bulk-action/')
def bulk_lead_action(request: HttpRequest, payload: BulkLeadActionIn) -> dict:
    _admin(request)
    leads = Lead.objects.filter(id__in=payload.lead_ids, is_active=True).only('id', 'email', 'founder_name')

    if payload.action == 'mark_follow_up':
        affected = leads.update(status='follow_up')
    elif payload.action == 'mark_won':
        affected = leads.update(status='won')
    elif payload.action == 'mark_closed':
        affected = leads.update(status='closed')
    elif payload.action == 'send_email':
        from apps.crm.tasks import send_bulk_email_task

        subject = payload.email_subject or 'Update from Nowic Studio'
        body = payload.email_body or ''
        send_bulk_email_task.delay(list(leads.values_list('id', flat=True)), subject, body)
        affected = leads.count()
    else:
        affected = 0

    return {'success': True, 'data': {'affected_count': affected}}


@router.get('/leads/stale/')
def stale_leads(request: HttpRequest):
    _admin(request)
    threshold = timezone.now() - timedelta(days=7)
    leads = Lead.objects.filter(status='follow_up', updated_at__lt=threshold, is_active=True).only(
        'id', 'company_name', 'founder_name', 'email', 'phone', 'source', 'status', 'notes', 'is_active', 'created_at', 'updated_at'
    )

    data = [
        {
            **LeadOut.from_orm(lead).dict(),
            'days_since_update': max(0, (timezone.now() - lead.updated_at).days),
        }
        for lead in leads
    ]
    return {'success': True, 'data': data}


@router.get('/projects/')
def list_projects(
    request: HttpRequest,
    status: Optional[str] = Query(default=None),
    page: int = Query(default=1),
    page_size: int = Query(default=10),
) -> dict:
    _admin(request)
    projects = Project.objects.only('id', 'name', 'deadline', 'cost', 'progress', 'status', 'created_at')
    if status:
        projects = projects.filter(status=status)
    return paginate(projects, page=page, page_size=page_size, serializer=lambda p: ProjectOut.from_orm(p).dict())


@router.patch('/projects/{project_id}/')
def update_project(request: HttpRequest, project_id: int, payload: ProjectStatusUpdate) -> dict:
    admin = _admin(request)
    try:
        project = Project.objects.only('id', 'name', 'deadline', 'cost', 'progress', 'status', 'created_at').get(id=project_id)
    except Project.DoesNotExist:
        raise NotFound(f'Project #{project_id} not found')

    old_value = {'progress': project.progress, 'status': project.status}

    if payload.progress is not None:
        project.progress = max(0, min(100, payload.progress))
    if payload.status is not None:
        project.status = payload.status
    project.save()

    log_action(
        actor_clerk_id=admin.clerk_user_id,
        actor_email=admin.email,
        action=AuditAction.PROJECT_UPDATED,
        resource_type='project',
        resource_id=project.id,
        old_value=old_value,
        new_value={'progress': project.progress, 'status': project.status},
        ip=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )

    return {'success': True, 'data': ProjectOut.from_orm(project).dict()}


@router.get('/submissions/')
def list_submissions(
    request: HttpRequest,
    status: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1),
    page_size: int = Query(default=10),
) -> dict:
    _admin(request)
    qs = ContactSubmission.objects.select_related('service_interest').only(
        'id', 'name', 'email', 'project_type', 'message', 'status', 'priority', 'phone', 'budget',
        'reply_note', 'replied_at', 'ip_address', 'submitted_at',
        'service_interest__name', 'service_interest__slug', 'service_interest__price_starting'
    ).order_by('-submitted_at')

    if status:
        qs = qs.filter(status=status)
    if priority:
        qs = qs.filter(priority=priority)
    if search:
        qs = search_submissions(search).filter(id__in=qs.values_list('id', flat=True))

    return paginate(
        qs,
        page=page,
        page_size=page_size,
        serializer=lambda submission: ContactAdminOut(
            id=submission.id,
            name=submission.name,
            email=submission.email,
            project_type=submission.project_type,
            message=submission.message,
            phone=submission.phone,
            budget=submission.budget,
            status=submission.status,
            priority=submission.priority,
            replied_at=submission.replied_at,
            reply_note=submission.reply_note,
            ip_address=submission.ip_address,
            submitted_at=submission.submitted_at,
            service_interest=(
                {
                    'name': submission.service_interest.name,
                    'slug': submission.service_interest.slug,
                    'price_starting': submission.service_interest.price_starting,
                }
                if submission.service_interest
                else None
            ),
        ).dict(),
    )


@router.patch('/submissions/{submission_id}/')
def update_submission(request: HttpRequest, submission_id: int, payload: SubmissionUpdateIn) -> dict:
    admin = _admin(request)
    try:
        submission = ContactSubmission.objects.select_related('service_interest').only(
            'id', 'name', 'email', 'project_type', 'message', 'status', 'priority', 'phone', 'budget',
            'reply_note', 'replied_at', 'ip_address', 'submitted_at',
            'service_interest__name', 'service_interest__slug', 'service_interest__price_starting'
        ).get(id=submission_id)
    except ContactSubmission.DoesNotExist:
        raise NotFound(f'Submission #{submission_id} not found')

    old_value = {
        'status': submission.status,
        'priority': submission.priority,
        'reply_note': submission.reply_note,
        'replied_at': submission.replied_at.isoformat() if submission.replied_at else None,
    }

    update_fields = []
    if payload.status is not None:
        submission.status = payload.status
        update_fields.append('status')
    if payload.priority is not None:
        submission.priority = payload.priority
        update_fields.append('priority')
    if payload.reply_note is not None:
        submission.reply_note = sanitize_string(payload.reply_note)
        update_fields.append('reply_note')

    if payload.status == 'replied':
        submission.replied_at = timezone.now()
        update_fields.append('replied_at')
        send_contact_reply(submission.email, submission.reply_note or '')
        log_action(
            actor_clerk_id=admin.clerk_user_id,
            actor_email=admin.email,
            action=AuditAction.SUBMISSION_REPLIED,
            resource_type='submission',
            resource_id=submission.id,
            old_value=old_value,
            new_value={'status': 'replied', 'reply_note': submission.reply_note},
            ip=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

    if update_fields:
        submission.save(update_fields=list(set(update_fields)))

    return {
        'success': True,
        'data': ContactAdminOut(
            id=submission.id,
            name=submission.name,
            email=submission.email,
            project_type=submission.project_type,
            message=submission.message,
            phone=submission.phone,
            budget=submission.budget,
            status=submission.status,
            priority=submission.priority,
            replied_at=submission.replied_at,
            reply_note=submission.reply_note,
            ip_address=submission.ip_address,
            submitted_at=submission.submitted_at,
            service_interest=(
                {
                    'name': submission.service_interest.name,
                    'slug': submission.service_interest.slug,
                    'price_starting': submission.service_interest.price_starting,
                }
                if submission.service_interest
                else None
            ),
        ).dict(),
    }


@router.get('/submissions/{submission_id}/')
def get_submission(request: HttpRequest, submission_id: int) -> dict:
    _admin(request)
    try:
        submission = ContactSubmission.objects.select_related('service_interest').only(
            'id', 'name', 'email', 'project_type', 'message', 'status', 'priority', 'phone', 'budget',
            'reply_note', 'replied_at', 'ip_address', 'submitted_at',
            'service_interest__name', 'service_interest__slug', 'service_interest__price_starting'
        ).get(id=submission_id)
    except ContactSubmission.DoesNotExist:
        raise NotFound(f'Submission #{submission_id} not found')

    return {
        'success': True,
        'data': ContactAdminOut(
            id=submission.id,
            name=submission.name,
            email=submission.email,
            project_type=submission.project_type,
            message=submission.message,
            phone=submission.phone,
            budget=submission.budget,
            status=submission.status,
            priority=submission.priority,
            replied_at=submission.replied_at,
            reply_note=submission.reply_note,
            ip_address=submission.ip_address,
            submitted_at=submission.submitted_at,
            service_interest=(
                {
                    'name': submission.service_interest.name,
                    'slug': submission.service_interest.slug,
                    'price_starting': submission.service_interest.price_starting,
                }
                if submission.service_interest
                else None
            ),
        ).dict(),
    }


@router.delete('/submissions/{submission_id}/')
def delete_submission(request: HttpRequest, submission_id: int) -> dict:
    _admin(request)
    deleted, _ = ContactSubmission.objects.filter(id=submission_id).delete()
    if not deleted:
        raise NotFound(f'Submission #{submission_id} not found')
    return {'success': True, 'message': 'Submission deleted'}


@router.get('/analytics/service-demand/')
def service_demand_analytics(request: HttpRequest) -> dict:
    _admin(request)

    total_inquiries = ContactSubmission.objects.count()
    unlinked_inquiries = ContactSubmission.objects.filter(service_interest__isnull=True).count()
    grouped = list(
        ContactSubmission.objects.filter(service_interest__isnull=False)
        .values('service_interest__name', 'service_interest__slug')
        .annotate(inquiry_count=Count('id'))
        .order_by('-inquiry_count')
    )

    by_service = [
        {
            'service_name': row['service_interest__name'],
            'service_slug': row['service_interest__slug'],
            'inquiry_count': row['inquiry_count'],
            'percentage': round((row['inquiry_count'] / total_inquiries) * 100, 2) if total_inquiries else 0.0,
        }
        for row in grouped
    ]

    return {
        'success': True,
        'data': {
            'by_service': by_service,
            'unlinked_inquiries': unlinked_inquiries,
            'total_inquiries': total_inquiries,
            'top_service': by_service[0]['service_name'] if by_service else '',
        },
    }


@router.get('/stats/')
def get_crm_stats(request: HttpRequest) -> dict:
    _admin(request)
    from apps.booking.models import Appointment

    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    active_leads = Lead.objects.filter(is_active=True)
    lead_status_counts = active_leads.values('status').annotate(count=Count('status'))
    lead_statuses = {item['status']: item['count'] for item in lead_status_counts}

    all_projects = Project.objects.all()
    delivered = all_projects.filter(status='delivered')
    total_revenue = delivered.aggregate(total_revenue=Sum('cost'))['total_revenue'] or Decimal('0.00')

    all_appointments = Appointment.objects.all()
    all_submissions = ContactSubmission.objects.all()

    return {
        'success': True,
        'data': {
            'leads': {
                'total': active_leads.count(),
                'by_status': lead_statuses,
                'this_month': active_leads.filter(created_at__gte=month_start).count(),
            },
            'projects': {
                'total': all_projects.count(),
                'in_progress': all_projects.filter(status='in_progress').count(),
                'delivered': delivered.count(),
                'total_revenue': str(total_revenue),
            },
            'bookings': {
                'total': all_appointments.count(),
                'this_month': all_appointments.filter(booked_at__gte=month_start).count(),
                'pending': all_appointments.filter(status='pending').count(),
            },
            'submissions': {
                'total': all_submissions.count(),
                'unread': all_submissions.filter(status='new').count(),
            },
        },
    }
