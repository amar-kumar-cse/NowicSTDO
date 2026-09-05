"""
apps/crm/admin_api.py

Admin dashboard and management endpoints.
"""
from datetime import timedelta
from decimal import Decimal
from typing import Optional, Any

from django.db.models import F, Q, Sum
from django.http import HttpRequest
from django.utils import timezone
import uuid
from django.core.exceptions import ValidationError

from django.core.files.storage import default_storage
from ninja import File, Query, Router, Schema
from ninja.files import UploadedFile

import logging

logger = logging.getLogger('nowic.api')

from apps.booking.models import Appointment
from apps.client.models import Invoice, ProjectClientAssignment, ProjectFile, ProjectUpdate
from apps.client.schemas import InvoiceCreateIn, InvoiceUpdateIn, ProjectFileIn, ProjectUpdateIn
from apps.crm.models import Lead, Project
from apps.notifications.utils import create_notification
from apps.public.models import ContactSubmission, PortfolioProject, ServiceOffering, SiteContent, BlogPost
from apps.public.schemas import SiteContentOut, BlogPostOut, BlogPostIn
from apps.users.models import UserProfile
from apps.audit.utils import log_action
from shared.audit import AuditAction
from shared.auth import clerk_auth, get_admin_user
from shared.email import send_invoice_email, send_invoice_overdue, send_project_update_email
from shared.exceptions import NotFound, PermissionDenied
from shared.pagination import paginate
from shared.schemas import standard_responses

router = Router(tags=['Admin'], auth=clerk_auth)


def _admin(request: HttpRequest) -> UserProfile:
    return get_admin_user(request)


class UserRoleUpdateIn(Schema):
    role: str


class SiteContentUpsertIn(Schema):
    data: Any


@router.get('/dashboard/', response=standard_responses(dict))
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


@router.get('/site-content/', response=standard_responses(list))
def list_site_content(request: HttpRequest):
    _admin(request)
    rows = SiteContent.objects.only('section', 'data', 'updated_at').order_by('section')
    return {
        'success': True,
        'data': [SiteContentOut.from_orm(row).dict() for row in rows],
    }


@router.get('/site-content/{section}/', response=standard_responses(dict))
def get_site_content(request: HttpRequest, section: str):
    _admin(request)
    try:
        row = SiteContent.objects.only('section', 'data', 'updated_at').get(section=section)
        data = SiteContentOut.from_orm(row).dict()
    except SiteContent.DoesNotExist:
        raise NotFound(f"Section '{section}' not found")

    return {
        'success': True,
        'data': data,
    }


@router.put('/site-content/{section}/', response=standard_responses(dict))
@router.patch('/site-content/{section}/', response=standard_responses(dict))
def upsert_site_content(request: HttpRequest, section: str, payload: SiteContentUpsertIn):
    _admin(request)
    row, _ = SiteContent.objects.update_or_create(section=section, defaults={'data': payload.data})
    return {
        'success': True,
        'data': SiteContentOut.from_orm(row).dict(),
    }


ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post('/upload/media/', response=standard_responses(dict))
def upload_media(request: HttpRequest, file: UploadedFile = File(...), folder: str = 'services'):
    """Upload an image file to cloud storage and return the URL."""
    _admin(request)

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationError('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed.')

    if file.size > MAX_IMAGE_SIZE:
        raise ValidationError('File size must be under 5 MB.')

    ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else 'jpg'
    safe_folder = folder.strip('/').replace('..', '').replace('\\', '') or 'services'
    filename = f'{safe_folder}/{uuid.uuid4().hex[:12]}.{ext}'

    saved_path = default_storage.save(filename, file)
    url = default_storage.url(saved_path)

    return {
        'success': True,
        'data': {
            'url': url,
            'filename': saved_path,
        },
    }


@router.get('/me/', response=standard_responses(dict))
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


@router.get('/users/', response=standard_responses(dict))
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


@router.patch('/users/{clerk_user_id}/', response=standard_responses(dict))
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


@router.get('/search/', response=standard_responses(dict))
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


@router.post('/projects/{project_id}/updates/', response=standard_responses(dict))
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


@router.post('/projects/{project_id}/files/', response=standard_responses(dict))
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


@router.post('/invoices/', response=standard_responses(dict))
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


@router.patch('/invoices/{invoice_id}/', response=standard_responses(dict))
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


@router.get('/invoices/', response=standard_responses(list))
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

    invoices = list(qs)
    project_ids = [inv.project_id for inv in invoices if inv.project_id]

    assignments = ProjectClientAssignment.objects.select_related('client').only(
        'client__email', 'client__full_name', 'project_id'
    ).filter(project_id__in=project_ids)

    assignment_map = {a.project_id: a for a in assignments}

    data = []
    for invoice in invoices:
        assignment = assignment_map.get(invoice.project_id)

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
                    'full_name': assignment.client.full_name if assignment and assignment.client else '',
                    'email': assignment.client.email if assignment and assignment.client else '',
                },
            }
        )

    return {'success': True, 'data': data}


# ─── Reviews Moderation ─────────────────────────────────────────────────────

@router.get('/reviews/', response=standard_responses(list))
def list_all_reviews(request: HttpRequest):
    _admin(request)
    from apps.public.models import CustomerReview
    from apps.public.schemas import ReviewOut

    qs = CustomerReview.objects.all().order_by('-created_at')
    data = [ReviewOut.from_orm(r).dict() for r in qs]
    return {'success': True, 'data': data}


@router.patch('/reviews/{review_id}/', response=standard_responses(dict))
def update_review(request: HttpRequest, review_id: int, is_approved: bool):
    _admin(request)
    from apps.public.models import CustomerReview
    
    try:
        review = CustomerReview.objects.get(id=review_id)
        review.is_approved = is_approved
        review.save(update_fields=['is_approved'])
        return {'success': True, 'message': 'Review updated'}
    except CustomerReview.DoesNotExist:
        raise NotFound('Review not found')


@router.delete('/reviews/{review_id}/', response=standard_responses(dict))
def delete_review(request: HttpRequest, review_id: int):
    _admin(request)
    from apps.public.models import CustomerReview
    
    try:
        review = CustomerReview.objects.get(id=review_id)
        review.delete()
        return {'success': True, 'message': 'Review deleted'}
    except CustomerReview.DoesNotExist:
        raise NotFound('Review not found')


# ─── Leads Export ───────────────────────────────────────────────────────────
import csv
from django.http import HttpResponse

@router.get('/leads/export/')
def export_leads_csv(request: HttpRequest):
    _admin(request)
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="leads_export.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['ID', 'Company Name', 'Founder Name', 'Email', 'Phone', 'Source', 'Status', 'Notes', 'Created At'])
    
    leads = Lead.objects.filter(is_active=True).order_by('-created_at')
    for lead in leads:
        writer.writerow([
            lead.id,
            lead.company_name,
            lead.founder_name,
            lead.email,
            lead.phone,
            lead.source,
            lead.status,
            lead.notes,
            lead.created_at.strftime('%Y-%m-%d %H:%M:%S') if lead.created_at else ''
        ])
        
    return response


# ─── Blog Management ─────────────────────────────────────────────────────────

@router.get('/blog/', response=standard_responses(dict))
def admin_list_blog_posts(
    request: HttpRequest,
    page: int = Query(default=1),
    page_size: int = Query(default=10),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
):
    _admin(request)
    qs = BlogPost.objects.all().order_by('-created_at')

    if search:
        qs = qs.filter(Q(title__icontains=search) | Q(excerpt__icontains=search))

    if status == 'published':
        qs = qs.filter(is_published=True)
    elif status == 'draft':
        qs = qs.filter(is_published=False)

    return paginate(qs, page=page, page_size=page_size, serializer=lambda p: BlogPostOut.from_orm(p).dict())


@router.get('/blog/stats/', response=standard_responses(dict))
def admin_blog_stats(request: HttpRequest):
    """Return quick stats: total, published, drafts, total views."""
    _admin(request)
    total = BlogPost.objects.count()
    published = BlogPost.objects.filter(is_published=True).count()
    drafts = total - published
    total_views = BlogPost.objects.aggregate(v=Sum('views_count'))['v'] or 0
    return {
        'success': True,
        'data': {
            'total': total,
            'published': published,
            'drafts': drafts,
            'total_views': total_views,
        }
    }


@router.get('/blog/{post_id}/', response=standard_responses(dict))
def admin_get_blog_post(request: HttpRequest, post_id: int):
    """Get a single blog post by ID (admin)."""
    _admin(request)
    try:
        post = BlogPost.objects.get(id=post_id)
    except BlogPost.DoesNotExist:
        raise NotFound(f"Blog post #{post_id} not found")
    return {'success': True, 'data': BlogPostOut.from_orm(post).dict()}


@router.post('/blog/', response=standard_responses(dict))
def admin_create_blog_post(request: HttpRequest, payload: BlogPostIn):
    admin = _admin(request)
    
    try:
        if BlogPost.objects.filter(slug=payload.slug).exists():
            return {'success': False, 'error': f"Slug '{payload.slug}' already exists."}
            
        cover_img = ""
        if payload.cover_image_url:
            url = payload.cover_image_url.strip()
            if url.startswith('data:'):
                return {'success': False, 'error': 'Base64 image data cannot be saved directly as cover image URL. Please upload the image file using the upload button.'}
            cover_img = url

        post = BlogPost.objects.create(
            title=payload.title,
            slug=payload.slug,
            excerpt=payload.excerpt or "",
            content=payload.content,
            cover_image=cover_img,
            is_published=payload.is_published,
            read_time_minutes=payload.read_time_minutes or 5
        )
        
        try:
            new_val = BlogPostOut.from_orm(post).dict()
            for k, v in new_val.items():
                if hasattr(v, 'isoformat'):
                    new_val[k] = v.isoformat()
        except Exception:
            new_val = None

        try:
            log_action(
                actor_clerk_id=admin.clerk_user_id,
                actor_email=admin.email,
                action=AuditAction.PROJECT_UPDATED,
                resource_type='blog_post',
                resource_id=post.id,
                old_value=None,
                new_value=new_val,
                ip=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )
        except Exception as log_err:
            import logging
            logging.getLogger(__name__).error("Failed to write audit log: %s", log_err)
        
        return {'success': True, 'data': BlogPostOut.from_orm(post).dict()}
    except Exception as exc:
        import logging
        logging.getLogger(__name__).exception("Error creating blog post: %s", exc)
        return {'success': False, 'error': str(exc)}


class BlogPostUpdatePayload(Schema):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_published: Optional[bool] = None
    read_time_minutes: Optional[int] = None


@router.patch('/blog/{post_id}/', response=standard_responses(dict))
def admin_update_blog_post(request: HttpRequest, post_id: int, payload: BlogPostUpdatePayload):
    admin = _admin(request)
    try:
        post = BlogPost.objects.get(id=post_id)
    except BlogPost.DoesNotExist:
        raise NotFound(f"Blog post #{post_id} not found")
        
    try:
        try:
            old_val = BlogPostOut.from_orm(post).dict()
            for k, v in old_val.items():
                if hasattr(v, 'isoformat'):
                    old_val[k] = v.isoformat()
        except Exception:
            old_val = None
        
        update_data = payload.dict(exclude_none=True)
        
        if 'slug' in update_data and update_data['slug'] != post.slug:
            if BlogPost.objects.filter(slug=update_data['slug']).exclude(id=post_id).exists():
                return {'success': False, 'error': f"Slug '{update_data['slug']}' already exists."}
                
        if 'cover_image_url' in update_data:
            url = update_data.pop('cover_image_url')
            if not url:
                post.cover_image = ''
            else:
                url = url.strip()
                if url.startswith('data:'):
                    return {'success': False, 'error': 'Base64 image data cannot be saved directly as cover image URL. Please upload the image file using the upload button.'}
                post.cover_image = url
                
        for field, value in update_data.items():
            setattr(post, field, value)
            
        post.save()
        
        try:
            new_val = BlogPostOut.from_orm(post).dict()
            for k, v in new_val.items():
                if hasattr(v, 'isoformat'):
                    new_val[k] = v.isoformat()
        except Exception:
            new_val = None

        try:
            log_action(
                actor_clerk_id=admin.clerk_user_id,
                actor_email=admin.email,
                action=AuditAction.PROJECT_UPDATED,
                resource_type='blog_post',
                resource_id=post.id,
                old_value=old_val,
                new_value=new_val,
                ip=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )
        except Exception as log_err:
            import logging
            logging.getLogger(__name__).error("Failed to write audit log: %s", log_err)
        
        return {'success': True, 'data': BlogPostOut.from_orm(post).dict()}
    except Exception as exc:
        try:
            # Log payload and computed update data to help reproduce the error
            logger.exception("Error updating blog post #%s. payload=%s update_data=%s", post_id, getattr(payload, 'dict', lambda: str(payload))(), update_data)
        except Exception:
            logger.exception("Error updating blog post #%s: failed to serialize payload/update_data", post_id)
        return {'success': False, 'error': str(exc)}


@router.delete('/blog/{post_id}/', response=standard_responses(dict))
def admin_delete_blog_post(request: HttpRequest, post_id: int):
    admin = _admin(request)
    try:
        post = BlogPost.objects.get(id=post_id)
    except BlogPost.DoesNotExist:
        raise NotFound(f"Blog post #{post_id} not found")
        
    old_value = BlogPostOut.from_orm(post).dict()
    post.delete()
    
    log_action(
        actor_clerk_id=admin.clerk_user_id,
        actor_email=admin.email,
        action=AuditAction.PROJECT_UPDATED,
        resource_type='blog_post',
        resource_id=post_id,
        old_value=old_value,
        new_value=None,
        ip=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )
    
    return {'success': True, 'message': 'Blog post deleted'}

