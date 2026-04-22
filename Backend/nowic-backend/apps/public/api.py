"""
apps/public/api.py

Public-facing API — no authentication required.
Serves: services, portfolio, contact form, and homepage stats.
"""
import logging
from typing import Optional

from django.conf import settings
from django.db.models import Count
from django.db import DatabaseError
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import HttpRequest
from ninja import Router, Query

from apps.public.models import ServiceOffering, PortfolioProject, ContactSubmission, SiteContent
from apps.public.schemas import (
    ServiceOut,
    PortfolioProjectOut,
    ContactIn,
    ContactOut,
    SiteContentOut,
)
from shared.exceptions import NotFound, RateLimited
from shared.ratelimit import contact_limiter, get_client_ip
from shared.email import send_contact_confirmation, send_contact_notification
from shared.cache import cache_response
from shared.sanitize import sanitize_string, sanitize_email
from shared.logging import log_security_event
from shared.search import search_portfolio
from apps.notifications.utils import notify_all_admins

logger = logging.getLogger(__name__)

router = Router(tags=["Public"])



# ─── Services ────────────────────────────────────────────────────────────────

@router.get("/services/", auth=None)
@cache_response('services-list', timeout=300, namespace='services')
def list_services(request: HttpRequest):
    """Return all active service offerings."""
    services = ServiceOffering.objects.filter(is_active=True).annotate(
        inquiry_count=Count('contact_submissions')
    ).only(
        'id', 'name', 'slug', 'tagline', 'description', 'features', 'icon_name',
        'price_starting', 'delivery_days', 'is_active', 'order'
    )
    data = [ServiceOut.from_orm(s).dict() for s in services]
    return {"success": True, "data": data}


@router.get("/services/{slug}/", auth=None)
def get_service(request: HttpRequest, slug: str):
    """Return a single service by slug."""
    try:
        service = ServiceOffering.objects.filter(
            slug=slug,
            is_active=True,
        ).annotate(
            inquiry_count=Count('contact_submissions')
        ).only(
            'id', 'name', 'slug', 'tagline', 'description', 'features', 'icon_name',
            'price_starting', 'delivery_days', 'is_active', 'order'
        ).get()
    except ServiceOffering.DoesNotExist:
        raise NotFound(f"Service '{slug}' not found")
    return {"success": True, "data": ServiceOut.from_orm(service).dict()}


# ─── Site Content ───────────────────────────────────────────────────────────

@router.get('/site-content/', auth=None)
def list_site_content(request: HttpRequest):
    rows = SiteContent.objects.only('section', 'data', 'updated_at').order_by('section')
    return {
        'success': True,
        'data': [SiteContentOut.from_orm(row).dict() for row in rows],
    }


@router.get('/site-content/{section}/', auth=None)
def get_site_content(request: HttpRequest, section: str):
    try:
        row = SiteContent.objects.only('section', 'data', 'updated_at').get(section=section)
    except SiteContent.DoesNotExist:
        raise NotFound(f"Site content '{section}' not found")

    return {
        'success': True,
        'data': SiteContentOut.from_orm(row).dict(),
    }


# ─── Portfolio ───────────────────────────────────────────────────────────────

@router.get("/portfolio/", auth=None)
@cache_response('portfolio-list', timeout=300, namespace='portfolio')
def list_portfolio(
    request: HttpRequest,
    featured: Optional[bool] = Query(default=None),
    category: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
):
    """Return portfolio projects, optionally filtered by featured flag or category."""
    qs = PortfolioProject.objects.only('id', 'title', 'slug', 'category', 'is_featured', 'tech_stack', 'image')
    if featured is not None:
        qs = qs.filter(is_featured=featured)
    if category:
        qs = qs.filter(category=category)
    if search:
        qs = search_portfolio(search).filter(id__in=qs.values_list('id', flat=True))
    data = [PortfolioProjectOut.from_orm(p).dict() for p in qs]
    return {"success": True, "data": data, "total": len(data)}


@router.get("/portfolio/{slug}/", auth=None)
def get_portfolio_project(request: HttpRequest, slug: str):
    """Return a single portfolio project by slug."""
    try:
        project = PortfolioProject.objects.get(slug=slug)
    except PortfolioProject.DoesNotExist:
        raise NotFound(f"Portfolio project '{slug}' not found")
    return {"success": True, "data": PortfolioProjectOut.from_orm(project).dict()}


# ─── Contact Form ─────────────────────────────────────────────────────────────

@router.post("/contact/", auth=None)
def submit_contact(request: HttpRequest, payload: ContactIn):
    """
    Handle contact form submissions.

    Steps:
    1. Rate-limit by client IP (3 per hour)
    2. Save ContactSubmission
    3. Create a CRM Lead
    4. Send confirmation email to client
    5. Send notification email to admin
    """
    # 1. Rate limiting
    ip = get_client_ip(request)
    rl = contact_limiter.check(ip)
    if not rl["allowed"]:
        log_security_event('Rate limit exceeded', ip, details='contact form')
        raise RateLimited(retry_after=rl["reset_seconds"])

    # Sanitize input
    name = sanitize_string(payload.name)
    email = sanitize_email(payload.email)
    project_type = sanitize_string(payload.project_type or "")
    message = sanitize_string(payload.message)
    phone = sanitize_string(payload.phone or "")
    budget = sanitize_string(payload.budget or "")

    service_obj = None
    if payload.service_slug:
        service_obj = ServiceOffering.objects.filter(
            slug=payload.service_slug,
            is_active=True,
        ).only('id').first()

    # 2. Save submission
    submission = ContactSubmission.objects.create(
        name=name,
        email=email,
        project_type=project_type,
        message=message,
        phone=phone,
        budget=budget,
        service_interest=service_obj,
        ip_address=ip,
    )

    # 3. Create CRM lead (import here to avoid circular)
    try:
        from apps.crm.models import Lead
        Lead.objects.create(
            company_name="Direct Inquiry",
            founder_name=name,
            email=email,
            phone=phone,
            source="inbound",
            notes=message,
        )
    except (DatabaseError, DjangoValidationError) as exc:
        logger.error("Failed to create CRM lead from contact form: %s", exc)

    # 4 & 5. Emails (fail_silently=True inside helpers)
    send_contact_confirmation(payload.name, payload.email)
    send_contact_notification(
        payload.name, payload.email, payload.project_type or "General", payload.message
    )

    notify_all_admins(
        'new_contact',
        'New Contact Inquiry',
        f'{name} wants {project_type or "General"}',
        {'submission_id': submission.id, 'email': email},
    )

    return {
        "success": True,
        "data": {
            "id": submission.id,
            "message": "We will get back within 24 hours!",
        },
    }


# ─── Stats ───────────────────────────────────────────────────────────────────

@router.get("/stats/", auth=None)
@cache_response('homepage-stats', timeout=60, namespace='stats')
def get_stats(request: HttpRequest):
    """Return live-calculated agency statistics for the homepage."""
    from apps.crm.models import Project
    from apps.users.models import UserProfile

    data = {
        "projects_delivered": Project.objects.filter(status="delivered").count(),
        "happy_clients": UserProfile.objects.filter(role="client").count(),
        "services_offered": ServiceOffering.objects.filter(is_active=True).count(),
        "team_members": settings.TEAM_MEMBERS_COUNT,
    }
    return {"success": True, "data": data}
