"""
shared/exceptions.py

Custom exception classes for Nowic Studio backend.
All exceptions are registered as global handlers on the NinjaAPI instance.
"""
from django.http import JsonResponse
from django.conf import settings
import sentry_sdk


class NotFound(Exception):
    """Raised when a requested resource does not exist."""
    def __init__(self, msg: str = "Resource not found"):
        super().__init__(msg)
        self.msg = msg


class PermissionDenied(Exception):
    """Raised when a user lacks the required permissions."""
    def __init__(self, msg: str = "Permission denied"):
        super().__init__(msg)
        self.msg = msg


class ConflictError(Exception):
    """Raised when an action conflicts with existing state."""
    def __init__(self, msg: str = "Conflict"):
        super().__init__(msg)
        self.msg = msg


class RateLimited(Exception):
    """Raised when a rate limit has been exceeded."""
    def __init__(self, retry_after: int = 60, msg: str = "Too many requests"):
        super().__init__(msg)
        self.msg = msg
        self.retry_after = retry_after


def register_exception_handlers(api):
    """Register all custom exception handlers on a NinjaAPI instance."""

    @api.exception_handler(NotFound)
    def handle_not_found(request, exc):
        if not settings.DEBUG and getattr(settings, 'SENTRY_DSN', None):
            sentry_sdk.set_context("error_details", {"code": "NOT_FOUND", "msg": exc.msg})
            sentry_sdk.capture_exception(exc)
        return JsonResponse(
            {"success": False, "error": exc.msg, "code": "NOT_FOUND"},
            status=404,
        )

    @api.exception_handler(PermissionDenied)
    def handle_permission_denied(request, exc):
        if not settings.DEBUG and getattr(settings, 'SENTRY_DSN', None):
            sentry_sdk.set_context("error_details", {"code": "FORBIDDEN", "msg": exc.msg})
            sentry_sdk.capture_exception(exc)
        return JsonResponse(
            {"success": False, "error": exc.msg, "code": "FORBIDDEN"},
            status=403,
        )

    @api.exception_handler(ConflictError)
    def handle_conflict(request, exc):
        if not settings.DEBUG and getattr(settings, 'SENTRY_DSN', None):
            sentry_sdk.set_context("error_details", {"code": "CONFLICT", "msg": exc.msg})
            sentry_sdk.capture_exception(exc)
        return JsonResponse(
            {"success": False, "error": exc.msg, "code": "CONFLICT"},
            status=409,
        )

    @api.exception_handler(RateLimited)
    def handle_rate_limited(request, exc):
        if getattr(settings, 'SENTRY_DSN', None):
            sentry_sdk.set_context("error_details", {"code": "RATE_LIMITED", "retry_after": exc.retry_after})
            sentry_sdk.capture_exception(exc)
        return JsonResponse(
            {
                "success": False,
                "error": "Too many requests",
                "code": "RATE_LIMITED",
                "retry_after": exc.retry_after,
            },
            status=429,
        )

    from django.core.exceptions import ValidationError as DjangoValidationError
    @api.exception_handler(DjangoValidationError)
    def handle_django_validation_error(request, exc):
        return JsonResponse(
            {"success": False, "error": exc.messages if hasattr(exc, 'messages') else str(exc), "code": "VALIDATION_ERROR"},
            status=422,
        )

    @api.exception_handler(Exception)
    def handle_global_exception(request, exc):
        import logging
        
        logger = logging.getLogger('django.request')
        logger.error(f"Unhandled Exception: {exc}", exc_info=True)
        
        if getattr(settings, 'SENTRY_DSN', None):
            sentry_sdk.capture_exception(exc)
            
        return JsonResponse(
            {"success": False, "error": "An internal server error occurred", "code": "INTERNAL_ERROR"},
            status=500,
        )
