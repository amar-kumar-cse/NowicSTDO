"""
shared/auth.py

Clerk JWT authentication for Django Ninja using HttpBearer.
Fetches JWKS from Clerk and caches for 1 hour.
"""
import logging
import os
from typing import Optional

import jwt
import requests
from django.conf import settings
from django.core.cache import cache
from django.db import IntegrityError
from ninja.security import HttpBearer

from shared.exceptions import PermissionDenied

logger = logging.getLogger(__name__)


class ClerkAuth(HttpBearer):
    """
    Django Ninja HttpBearer that validates Clerk-issued JWT tokens.

    - Fetches Clerk's JWKS and caches for 3600 seconds.
    - Decodes with RS256; returns clerk_user_id (sub) on success.
    - Returns None on any failure — Ninja automatically sends 401.
    """

    def _get_jwks(self) -> dict:
        cache_key = "clerk:jwks"
        try:
            cached = cache.get(cache_key)
            if cached:
                return cached
        except Exception:
            logger.warning("Cache unavailable while reading Clerk JWKS", exc_info=True)
        try:
            resp = requests.get(settings.CLERK_JWKS_URL, timeout=10)
            resp.raise_for_status()
            jwks = resp.json()
            try:
                cache.set(cache_key, jwks, timeout=3600)
            except Exception:
                logger.warning("Cache unavailable while writing Clerk JWKS", exc_info=True)
            return jwks
        except (requests.RequestException, ValueError) as exc:
            logger.error("Failed to fetch Clerk JWKS: %s", exc)
            return {}

    def authenticate(self, request, token: str) -> Optional[str]:
        # Dev bypass: allow 'dev_token' if DEBUG is True and Clerk is likely not set up
        if settings.DEBUG and token == "dev_token":
            logger.info("Auth bypass: using dev_token in DEBUG mode")
            return "dev_anonymous_user"

        jwks = self._get_jwks()
        if not jwks:
            return None
        try:
            # Select signing key by kid from the cached JWKS
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            key_set = jwt.PyJWKSet.from_dict(jwks)
            signing_key_obj = None
            for k in key_set.keys:
                if k.key_id == kid:
                    signing_key_obj = k
                    break
            if signing_key_obj is None:
                logger.debug("No matching key found in JWKS for kid=%s", kid)
                return None

            # Conditionally verify audience and issuer based on env vars.
            # If either is empty, skip that verification (dev-friendly).
            clerk_audience = os.getenv("CLERK_AUDIENCE", "").strip()
            clerk_issuer = os.getenv("CLERK_ISSUER", "").strip()

            decode_options = {
                "verify_aud": bool(clerk_audience),
                "verify_iss": bool(clerk_issuer),
            }

            payload = jwt.decode(
                token,
                signing_key_obj.key,
                algorithms=["RS256"],
                audience=clerk_audience or None,
                issuer=clerk_issuer or None,
                options=decode_options,
            )
            request.clerk_payload = payload
            return payload.get("sub")
        except jwt.ExpiredSignatureError:
            logger.debug("Clerk JWT expired")
            return None
        except jwt.InvalidTokenError as exc:
            logger.debug("Clerk JWT invalid: %s", exc)
            return None
        except (ValueError, TypeError) as exc:
            logger.error("Unexpected auth error: %s", exc)
            return None


# Singleton auth instance used across the project
clerk_auth = ClerkAuth()


class APIKeyAuth(HttpBearer):
    """Bearer auth that validates hashed API keys from the database."""

    def authenticate(self, request, token: str) -> Optional[str]:
        from apps.apikeys.utils import verify_api_key

        api_key = verify_api_key(token)
        if api_key:
            return api_key.owner_clerk_id
        return None


api_key_auth = APIKeyAuth()


def extract_email_from_payload(payload: dict) -> str:
    """Extract email address if present in Clerk JWT claims."""
    if not isinstance(payload, dict):
        return ""
    email = payload.get("email") or payload.get("primary_email_address") or payload.get("email_address") or ""
    if not email and "claims" in payload and isinstance(payload["claims"], dict):
        email = payload["claims"].get("email") or payload["claims"].get("primary_email_address") or ""
    return str(email).strip().lower()


def fetch_clerk_user_details(clerk_user_id: str) -> dict:
    """If CLERK_SECRET_KEY is configured, fetch verified user details directly from Clerk."""
    clerk_secret = getattr(settings, 'CLERK_SECRET_KEY', '') or os.getenv('CLERK_SECRET_KEY', '')
    if not clerk_secret:
        return {}
    try:
        resp = requests.get(
            f"https://api.clerk.com/v1/users/{clerk_user_id}",
            headers={"Authorization": f"Bearer {clerk_secret}"},
            timeout=5
        )
        if resp.status_code == 200:
            data = resp.json()
            emails = data.get("email_addresses", [])
            primary_id = data.get("primary_email_address_id")
            email = ""
            for e in emails:
                if e.get("id") == primary_id:
                    email = e.get("email_address", "")
                    break
            if not email and emails:
                email = emails[0].get("email_address", "")
            first = data.get("first_name") or ""
            last = data.get("last_name") or ""
            full_name = f"{first} {last}".strip()
            return {"email": email.strip().lower(), "full_name": full_name}
    except Exception as exc:
        logger.warning("Failed to fetch Clerk user details: %s", exc)
    return {}


def get_admin_user(request):
    """
    Dependency: ensure the authenticated user has role='admin'.
    Raises PermissionDenied if not found or insufficient role.
    Auto-promotes/links if email is in ADMIN_EMAILS.
    Returns a UserProfile instance.
    """
    from apps.users.models import UserProfile  # avoid circular import

    clerk_user_id = request.auth
    if not clerk_user_id:
        raise PermissionDenied("Authentication required")
        
    if settings.DEBUG and clerk_user_id == "dev_anonymous_user":
        # Return a mock admin profile for development
        return UserProfile(
            clerk_user_id="dev_anonymous_user",
            email="dev-admin@example.com",
            full_name="Dev Admin (Mock)",
            role="admin"
        )

    admin_emails = getattr(settings, 'ADMIN_EMAILS', {'haiderssaqulain@gmail.com', 'amarkrydav@gmail.com', 'nowicstdo@gmail.com'})

    profile = None
    try:
        profile = UserProfile.objects.get(clerk_user_id=clerk_user_id)
    except UserProfile.DoesNotExist:
        # Profile not found by clerk_user_id. Attempt auto-recovery/linking.
        payload = getattr(request, 'clerk_payload', {})
        email = extract_email_from_payload(payload)
        full_name = ""

        if not email:
            details = fetch_clerk_user_details(clerk_user_id)
            email = details.get("email", "")
            full_name = details.get("full_name", "")

        if email:
            profile = UserProfile.objects.filter(email__iexact=email).first()
            if profile:
                profile.clerk_user_id = clerk_user_id
                if full_name and not profile.full_name:
                    profile.full_name = full_name
                if email.lower() in admin_emails:
                    profile.role = "admin"
                profile.is_active = True
                profile.save()
            elif email.lower() in admin_emails:
                profile = UserProfile.objects.create(
                    clerk_user_id=clerk_user_id,
                    email=email.lower(),
                    full_name=full_name or email.split('@')[0].replace('.', ' ').replace('_', ' ').title(),
                    role="admin",
                    is_active=True,
                )

    if not profile:
        raise PermissionDenied("User profile not found")

    # Soft-deleted users (Clerk user.deleted webhook) must not retain access.
    if not profile.is_active:
        raise PermissionDenied("Account is deactivated")

    if profile.role != "admin":
        if profile.email and profile.email.lower() in admin_emails:
            profile.role = "admin"
            profile.save(update_fields=["role"])
        else:
            raise PermissionDenied("Admin access required")
    return profile


def get_current_user(request):
    """
    Dependency: return the UserProfile for the authenticated Clerk user.
    Creates a new profile if it doesn't exist yet.
    Auto-promotes to 'admin' if email is in ADMIN_EMAILS.
    Returns a UserProfile instance.
    """
    from apps.users.models import UserProfile  # avoid circular import

    clerk_user_id = request.auth
    if not clerk_user_id:
        raise PermissionDenied("Authentication required")

    admin_emails = getattr(settings, 'ADMIN_EMAILS', {'haiderssaqulain@gmail.com', 'amarkrydav@gmail.com', 'nowicstdo@gmail.com'})

    try:
        profile = UserProfile.objects.get(clerk_user_id=clerk_user_id)
    except UserProfile.DoesNotExist:
        payload = getattr(request, 'clerk_payload', {})
        email = extract_email_from_payload(payload)
        full_name = ""

        if not email:
            details = fetch_clerk_user_details(clerk_user_id)
            email = details.get("email", "")
            full_name = details.get("full_name", "")

        if email:
            profile = UserProfile.objects.filter(email__iexact=email).first()
            if profile:
                profile.clerk_user_id = clerk_user_id
                if full_name and not profile.full_name:
                    profile.full_name = full_name
                if email.lower() in admin_emails:
                    profile.role = "admin"
                profile.is_active = True
                profile.save()
            else:
                profile = UserProfile.objects.create(
                    clerk_user_id=clerk_user_id,
                    email=email.lower(),
                    full_name=full_name or email.split('@')[0].title(),
                    role="admin" if email.lower() in admin_emails else "client",
                    is_active=True,
                )
        else:
            try:
                profile, _ = UserProfile.objects.get_or_create(
                    clerk_user_id=clerk_user_id,
                    defaults={
                        "email": f"{clerk_user_id}@placeholder.nowicstudio.in",
                        "role": "client",
                        "is_active": True,
                    },
                )
            except IntegrityError:
                raise PermissionDenied("User profile could not be provisioned")

    # Soft-deleted users must not get fresh profiles/access via this path.
    if not profile.is_active:
        raise PermissionDenied("Account is deactivated")
    if profile.email and profile.email.lower() in admin_emails and profile.role != "admin":
        profile.role = "admin"
        profile.save(update_fields=["role"])
    return profile
