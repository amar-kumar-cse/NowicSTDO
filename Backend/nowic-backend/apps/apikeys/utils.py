import hashlib
import secrets

from django.utils import timezone

from apps.apikeys.models import APIKey


def generate_api_key():
    raw_key = f"nw_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[:8]
    return raw_key, key_hash, key_prefix


def verify_api_key(raw_key: str):
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    try:
        api_key = APIKey.objects.only(
            'id', 'key_hash', 'owner_clerk_id', 'is_active', 'expires_at', 'last_used_at'
        ).get(key_hash=key_hash, is_active=True)
        if api_key.expires_at and api_key.expires_at < timezone.now():
            return None
        api_key.last_used_at = timezone.now()
        api_key.save(update_fields=['last_used_at'])
        return api_key
    except APIKey.DoesNotExist:
        return None
