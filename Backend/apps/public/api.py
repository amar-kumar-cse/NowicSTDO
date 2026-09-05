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
from django.db.models import F
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import HttpRequest
from ninja import Router, Query
from shared.auth import clerk_auth, get_admin_user
from shared.schemas import standard_responses

from apps.public.models import ServiceOffering, PortfolioProject, ContactSubmission, SiteContent, BlogPost
from apps.public.schemas import (
    ServiceOut,
    PortfolioProjectOut,
    ContactIn,
    ContactOut,
    SiteContentOut,
    ReviewIn,
    BlogPostOut,
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


@router.get('/site-content/{section}/', auth=None, response=standard_responses(dict))
def get_site_content(request: HttpRequest, section: str):
    try:
        row = SiteContent.objects.only('section', 'data', 'updated_at').get(section=section)
        data = SiteContentOut.from_orm(row).dict()
    except SiteContent.DoesNotExist:
        raise NotFound(f"Section '{section}' not found")

    return {
        'success': True,
        'data': data,
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
@router.get("/contact/choices/", auth=None)
def list_contact_choices(request: HttpRequest):
    """Expose fixed taxonomy for project types and budget options."""
    return {
        "success": True,
        "data": {
            "project_types": [{"label": display, "value": key} for key, display in ContactSubmission.PROJECT_TYPE_CHOICES],
            "budget_options": [{"label": display, "value": key} for key, display in ContactSubmission.BUDGET_CHOICES]
        }
    }


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
    # 1. Rate limiting & Honeypot
    if payload.website:
        logger.warning("Honeypot triggered from IP: %s", get_client_ip(request))
        return 400, {"success": False, "message": "Spam detected"}

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

    # 2. Save submission with validation
    submission = ContactSubmission(
        name=name,
        email=email,
        project_type=project_type,
        message=message,
        phone=phone,
        budget=budget,
        service_interest=service_obj,
        ip_address=ip,
    )
    
    try:
        submission.full_clean()
        submission.save()
    except DjangoValidationError as exc:
        logger.error("Contact validation failed: %s", exc)
        return 422, {"success": False, "message": "Invalid form data", "errors": exc.message_dict}

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

    # 4 & 5. Emails (fail_silently=True inside helpers) — use sanitized values
    send_contact_confirmation(name, email)
    send_contact_notification(
        name, email, project_type or "General", message
    )

    notify_all_admins(
        'new_contact',
        'New Contact Inquiry',
        f'{name} wants {project_type or "General"}',
        {'submission_id': submission.id, 'email': email},
    )

    # Webhook Notifications
    try:
        from shared.webhooks import notify_inbound_lead
        notify_inbound_lead(
            name=name,
            email=email,
            project_type=project_type,
            message=message,
            phone=phone,
            budget=budget
        )
    except Exception as e:
        logger.error("Failed to trigger contact webhooks: %s", e)

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


# ─── Reviews ─────────────────────────────────────────────────────────────────

@router.get("/reviews/", auth=None)
@cache_response('reviews-list', timeout=120, namespace='reviews')
def list_reviews(request: HttpRequest):
    """Return all approved customer reviews."""
    from apps.public.models import CustomerReview
    from apps.public.schemas import ReviewOut
    
    reviews = CustomerReview.objects.filter(is_approved=True)
    data = [ReviewOut.from_orm(r).dict() for r in reviews]
    return {"success": True, "data": data}


@router.post("/reviews/", auth=None)
def submit_review(request: HttpRequest, payload: ReviewIn):
    """Submit a new review (pending approval)."""
    from apps.public.models import CustomerReview
    
    # 1. Rate limiting by IP
    ip = get_client_ip(request)
    rl = contact_limiter.check(ip)
    if not rl["allowed"]:
        log_security_event('Rate limit exceeded', ip, details='review submission')
        raise RateLimited(retry_after=rl["reset_seconds"])

    # 2. Sanitize and save
    review = CustomerReview(
        client_name=sanitize_string(payload.client_name),
        company=sanitize_string(payload.company or ""),
        role=sanitize_string(payload.role or ""),
        rating=max(1, min(5, payload.rating)), # constrain 1-5
        review_text=sanitize_string(payload.review_text),
        avatar_url=payload.avatar_url or "",
        is_approved=False # always false on create
    )
    
    try:
        review.full_clean()
        review.save()
    except DjangoValidationError as exc:
        return 422, {"success": False, "message": "Invalid review data", "errors": exc.message_dict}

    # Notify admins
    notify_all_admins(
        'new_review',
        'New Customer Review',
        f'{review.client_name} submitted a {review.rating}-star review.',
        {'review_id': review.id},
    )

    return {
        "success": True,
        "data": {
            "id": review.id,
            "message": "Thank you for your review! It will be visible once approved.",
        },
    }


@router.get('/convert-paths/', auth=clerk_auth)
def convert_paths_endpoint(request):
    get_admin_user(request)
    from django.core.files.storage import default_storage
    from apps.public.models import SiteContent
    
    def convert_item(item):
        if isinstance(item, dict):
            return {k: convert_item(v) for k, v in item.items()}
        elif isinstance(item, list):
            return [convert_item(i) for i in item]
        elif isinstance(item, str):
            if item.startswith('/media/'):
                relative_path = item.replace('/media/', '')
                try:
                    from django.conf import settings
                    if hasattr(settings, 'CLOUDINARY_STORAGE') and settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'):
                        import cloudinary
                        import cloudinary.utils
                        cloudinary.config(
                            cloud_name=settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'),
                            api_key=settings.CLOUDINARY_STORAGE.get('API_KEY'),
                            api_secret=settings.CLOUDINARY_STORAGE.get('API_SECRET')
                        )
                        # Generates the cloudinary URL (url, options)
                        url, _ = cloudinary.utils.cloudinary_url(relative_path)
                        return url
                    return default_storage.url(relative_path)
                except Exception as e:
                    logger.error(f"Failed to convert path {item}: {e}")
                    return item
            return item
        return item

    updated = 0
    for content in SiteContent.objects.all():
        orig = content.data
        new = convert_item(orig)
        if new != orig:
            content.data = new
            content.save()
            updated += 1
    return {"status": "success", "updated_sections": updated}


# ─── Blog ────────────────────────────────────────────────────────────────────

@router.get("/blog/", auth=None)
@cache_response('blog-list', timeout=180, namespace='blog')
def list_blog_posts(request: HttpRequest):
    """Return all published blog posts."""
    posts = BlogPost.objects.filter(is_published=True).order_by('-created_at')
    data = [BlogPostOut.from_orm(p).dict() for p in posts]
    return {"success": True, "data": data}


@router.get("/blog/{slug}/", auth=None)
def get_blog_post(request: HttpRequest, slug: str):
    """Return a single published blog post by slug and increment views count."""
    try:
        post = BlogPost.objects.get(slug=slug, is_published=True)
    except BlogPost.DoesNotExist:
        raise NotFound(f"Blog post '{slug}' not found")
    
    # Increment views count atomically to avoid lost updates under concurrency
    try:
        BlogPost.objects.filter(pk=post.pk).update(views_count=F('views_count') + 1)
        post.refresh_from_db(fields=['views_count'])
    except Exception as e:
        logger.exception("Failed to increment views count for %s: %s", slug, e)
    
    return {"success": True, "data": BlogPostOut.from_orm(post).dict()}


