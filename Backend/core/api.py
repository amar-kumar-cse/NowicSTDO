"""
core/api.py

NinjaAPI root — wires all routers and exception handlers together.
"""
from ninja import NinjaAPI
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache

from shared.auth import clerk_auth
from shared.exceptions import register_exception_handlers

from apps.users.api import router as webhook_router
from apps.public.api import router as public_router
from apps.crm.api import router as crm_router
from apps.crm.admin_api import router as crm_admin_router
from apps.booking.api import router as booking_router
from apps.notifications.api import router as notifications_router
from apps.analytics.api import router as analytics_router
from apps.client.api import router as client_router
from apps.audit.api import router as audit_router
from apps.apikeys.api import router as apikeys_router

api = NinjaAPI(
    title="Nowic Studio API",
    version="1.0.0",
    description=(
        "Production API for Nowic Studio — a software agency. "
        "Provides public content, CRM management, and booking endpoints."
    ),
    docs_url="/api/docs" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None,
    auth=clerk_auth,
)

# ── Health Check ─────────────────────────────────────────────────────────────
@api.get("/health/", tags=["system"], auth=None)
def health_check(request):
    from django.db import connection
    from django.db.utils import DatabaseError, OperationalError

    try:
        connection.ensure_connection()
        db_status = "ok"
    except (OperationalError, DatabaseError):
        db_status = "error"

    try:
        cache.set('healthcheck', 'ok', timeout=10)
        cache_status = 'ok' if cache.get('healthcheck') == 'ok' else 'error'
    except Exception:
        cache_status = 'error'

    try:
        from core.celery import app as celery_app

        celery_app.control.ping(timeout=0.5)
        celery_status = 'ok'
    except Exception:
        celery_status = 'error'

    overall = 'ok' if db_status == 'ok' and cache_status == 'ok' and celery_status == 'ok' else 'degraded'
    
    return {
        "status": overall,
        "version": "1.0.0",
        "checks": {
            "database": db_status,
            "cache": cache_status,
            "celery": celery_status,
        },
        "timestamp": timezone.now().isoformat()
    }

# ── Register global exception handlers ───────────────────────────────────────
register_exception_handlers(api)

# ── Mount routers ─────────────────────────────────────────────────────────────
api.add_router("/webhook/", webhook_router)
api.add_router("/v1/public/", public_router)
api.add_router("/v1/crm/", crm_router)
api.add_router("/v1/admin/", crm_admin_router)
api.add_router("/v1/booking/", booking_router)
api.add_router("/v1/notifications/", notifications_router)
api.add_router("/v1/analytics/", analytics_router)
api.add_router("/v1/client/", client_router)
api.add_router("/v1/admin/", audit_router)
api.add_router("/v1/admin/", apikeys_router)
