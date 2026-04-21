"""
apps/users/api.py

Clerk webhook endpoint — syncs Clerk user events to UserProfile.
Signature verified via Svix before any processing.
"""
import json
import logging
import binascii

from django.conf import settings
from django.http import HttpRequest
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from ninja import Router
from svix.webhooks import Webhook, WebhookVerificationError

from apps.users.models import UserProfile
from shared.sanitize import sanitize_email

logger = logging.getLogger(__name__)

router = Router(tags=["Webhooks"])


def _get_primary_email(data: dict) -> str:
    """Extract the primary email address from Clerk webhook data."""
    emails = data.get("email_addresses", [])
    primary_id = data.get("primary_email_address_id")
    for email_obj in emails:
        if email_obj.get("id") == primary_id:
            return email_obj.get("email_address", "")
    # Fallback: first email address
    if emails:
        return emails[0].get("email_address", "")
    return ""


def _get_full_name(data: dict) -> str:
    first = data.get("first_name") or ""
    last = data.get("last_name") or ""
    return f"{first} {last}".strip()


@router.post("/clerk/", auth=None, response={200: dict, 400: dict, 409: dict})
def clerk_webhook(request: HttpRequest):
    """
    Receive and process Clerk user lifecycle events.

    Verifies the Svix signature, then handles:
    - user.created  → Create UserProfile
    - user.updated  → Update existing UserProfile
    - user.deleted  → Soft-delete (is_active=False)
    """
    payload_bytes = request.body

    # ── 1. Verify Svix signature ─────────────────────────────────────────────
    svix_id = request.headers.get("svix-id", "")
    svix_timestamp = request.headers.get("svix-timestamp", "")
    svix_signature = request.headers.get("svix-signature", "")

    try:
        wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
    except (ValueError, TypeError, binascii.Error) as exc:
        logger.error("Webhook setup failure: %s", exc)
        return 400, {
            "success": False,
            "error": "Webhook configuration error",
            "code": "WEBHOOK_CONFIG_ERROR",
        }

    try:
        event = wh.verify(
            payload_bytes,
            {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
        )
    except WebhookVerificationError:
        logger.warning("Clerk webhook signature verification failed")
        return 400, {
            "success": False,
            "error": "Invalid signature",
            "code": "INVALID_SIGNATURE",
        }

    event_type = event.get("type", "")
    data = event.get("data", {})
    clerk_user_id = data.get("id", "")

    if event_type in {"user.created", "user.updated", "user.deleted"} and not clerk_user_id:
        logger.warning("Webhook missing user id for event=%s", event_type)
        return 400, {
            "success": False,
            "error": "Invalid payload",
            "code": "INVALID_PAYLOAD",
        }

    logger.info("Processing Clerk webhook: %s for user %s", event_type, clerk_user_id)

    # ── 2. Handle event types ────────────────────────────────────────────────
    if event_type == "user.created":
        try:
            email = sanitize_email(_get_primary_email(data))
        except DjangoValidationError:
            logger.warning("Clerk webhook user.created missing/invalid email for user %s", clerk_user_id)
            return 400, {
                "success": False,
                "error": "Invalid payload",
                "code": "INVALID_PAYLOAD",
            }
        full_name = _get_full_name(data)
        try:
            UserProfile.objects.get_or_create(
                clerk_user_id=clerk_user_id,
                defaults={
                    "email": email,
                    "full_name": full_name,
                    "role": "client",
                    "is_active": True,
                },
            )
        except IntegrityError:
            logger.warning("Clerk webhook user.created email conflict for user %s", clerk_user_id)
            return 409, {
                "success": False,
                "error": "Email already linked to another user",
                "code": "EMAIL_CONFLICT",
            }
        logger.info("Created UserProfile for %s", clerk_user_id)

    elif event_type == "user.updated":
        try:
            email = sanitize_email(_get_primary_email(data))
        except DjangoValidationError:
            logger.warning("Clerk webhook user.updated missing/invalid email for user %s", clerk_user_id)
            return 400, {
                "success": False,
                "error": "Invalid payload",
                "code": "INVALID_PAYLOAD",
            }
        full_name = _get_full_name(data)
        try:
            UserProfile.objects.update_or_create(
                clerk_user_id=clerk_user_id,
                defaults={
                    "email": email,
                    "full_name": full_name,
                    "role": "client",
                    "is_active": True,
                },
            )
        except IntegrityError:
            logger.warning("Clerk webhook user.updated email conflict for user %s", clerk_user_id)
            return 409, {
                "success": False,
                "error": "Email already linked to another user",
                "code": "EMAIL_CONFLICT",
            }
        logger.info("Updated UserProfile for %s", clerk_user_id)

    elif event_type == "user.deleted":
        UserProfile.objects.filter(clerk_user_id=clerk_user_id).update(is_active=False)
        logger.info("Soft-deleted UserProfile for %s", clerk_user_id)

    else:
        logger.debug("Unhandled Clerk event type: %s", event_type)

    return {"success": True}
