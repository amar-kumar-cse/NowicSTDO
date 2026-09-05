"""
apps/booking/signals.py

Auto-sync BookingService whenever a ServiceOffering is saved or deleted
in the admin panel. This ensures the booking page always reflects the
latest services without any manual duplication.

Rules:
  - ServiceOffering created  → BookingService created (if not exists)
  - ServiceOffering updated  → BookingService updated (name, slug, is_active)
  - ServiceOffering deleted  → BookingService deactivated (NOT deleted,
                               to preserve historical Appointment FK refs)
  - price_starting → price   (fallback 0 if null)
  - delivery_days not mapped (BookingService uses duration_minutes instead;
    default 60 min is used when ServiceOffering has no delivery_days analog)
"""

import logging

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

logger = logging.getLogger(__name__)

# Default duration (minutes) used when creating a BookingService from a
# ServiceOffering that has no meeting-duration information.
DEFAULT_DURATION_MINUTES = 60


@receiver(post_save, sender="public.ServiceOffering")
def sync_booking_service_on_save(sender, instance, created, **kwargs):
    """
    Keep BookingService in sync whenever a ServiceOffering is saved.
    Uses get_or_create so re-saves are idempotent.
    """
    if kwargs.get('raw'):
        return

    from apps.booking.models import BookingService  # late import avoids circular

    defaults = {
        "name": instance.name,
        "is_active": instance.is_active,
        "price": instance.price_starting or 0,
        # Only update duration if BookingService already exists with default;
        # preserves manually-set durations.
    }

    booking_service, created_bs = BookingService.objects.get_or_create(
        slug=instance.slug,
        defaults={
            **defaults,
            "description": instance.description or instance.tagline or "",
            "duration_minutes": DEFAULT_DURATION_MINUTES,
        },
    )

    if not created_bs:
        # Update fields that should always mirror ServiceOffering
        booking_service.name = instance.name
        booking_service.is_active = instance.is_active
        booking_service.price = instance.price_starting or 0
        # Update description only if it still matches the old value or is blank
        if not booking_service.description or booking_service.description == booking_service.name:
            booking_service.description = instance.description or instance.tagline or ""
        booking_service.save(update_fields=["name", "is_active", "price", "description"])

    action = "Created" if created_bs else "Updated"
    logger.info(
        "[booking.signals] %s BookingService '%s' (slug=%s) from ServiceOffering pk=%s",
        action,
        booking_service.name,
        booking_service.slug,
        instance.pk,
    )


@receiver(post_delete, sender="public.ServiceOffering")
def deactivate_booking_service_on_delete(sender, instance, **kwargs):
    """
    When a ServiceOffering is deleted, deactivate (not delete) the matching
    BookingService so existing Appointment FK references remain intact.
    """
    from apps.booking.models import BookingService

    updated = BookingService.objects.filter(slug=instance.slug).update(is_active=False)
    if updated:
        logger.info(
            "[booking.signals] Deactivated BookingService slug='%s' after ServiceOffering delete",
            instance.slug,
        )
