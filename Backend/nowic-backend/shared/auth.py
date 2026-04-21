"""
shared/auth.py

Clerk JWT authentication for Django Ninja using HttpBearer.
Fetches JWKS from Clerk and caches for 1 hour.
"""
import logging
from typing import Optional

import jwt
import requests
from django.conf import settings
from django.core.cache import cache
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
        cached = cache.get(cache_key)
        if cached:
            return cached
        try:
            resp = requests.get(settings.CLERK_JWKS_URL, timeout=10)
            resp.raise_for_status()
            jwks = resp.json()
            cache.set(cache_key, jwks, timeout=3600)
            return jwks
        except (requests.RequestException, ValueError) as exc:
            logger.error("Failed to fetch Clerk JWKS: %s", exc)
            return {}

    def authenticate(self, request, token: str) -> Optional[str]:
        if not settings.CLERK_AUDIENCE or not settings.CLERK_ISSUER:
            logger.error("CLERK_AUDIENCE and CLERK_ISSUER must be configured")
            return None

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
            payload = jwt.decode(
                token,
                signing_key_obj.key,
                algorithms=["RS256"],
                audience=settings.CLERK_AUDIENCE,
                issuer=settings.CLERK_ISSUER,
                options={"verify_aud": True, "verify_iss": True},
            )
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


def get_admin_user(request):
    """
    Dependency: ensure the authenticated user has role='admin'.
    Raises PermissionDenied if not found or insufficient role.
    Returns a UserProfile instance.
    """
    from apps.users.models import UserProfile  # avoid circular import

    clerk_user_id = request.auth
    if not clerk_user_id:
        raise PermissionDenied("Authentication required")
    try:
        profile = UserProfile.objects.get(clerk_user_id=clerk_user_id)
    except UserProfile.DoesNotExist:
        raise PermissionDenied("User profile not found")
    if profile.role != "admin":
        raise PermissionDenied("Admin access required")
    return profile


def get_current_user(request):
    """
    Dependency: return the UserProfile for the authenticated Clerk user.
    Creates a new profile with role='client' if it doesn't exist yet.
    Returns a UserProfile instance.
    """
    from apps.users.models import UserProfile  # avoid circular import

    clerk_user_id = request.auth
    if not clerk_user_id:
        raise PermissionDenied("Authentication required")
    profile, _ = UserProfile.objects.get_or_create(
        clerk_user_id=clerk_user_id,
        defaults={"role": "client"},
    )
    return profile
