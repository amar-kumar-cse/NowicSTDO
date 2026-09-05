from datetime import timedelta

from django.http import HttpRequest
from django.utils import timezone
from ninja import Router, Schema

from apps.apikeys.models import APIKey
from apps.apikeys.utils import generate_api_key
from shared.auth import clerk_auth, get_admin_user
from shared.exceptions import NotFound

router = Router(tags=['API Keys'], auth=clerk_auth)


class APIKeyGenerateIn(Schema):
    name: str
    expires_days: int | None = None


@router.get('/api-keys/')
def list_api_keys(request: HttpRequest):
    admin = get_admin_user(request)
    keys = APIKey.objects.only(
        'id', 'name', 'key_prefix', 'owner_clerk_id', 'is_active', 'last_used_at', 'created_at', 'expires_at'
    ).filter(owner_clerk_id=admin.clerk_user_id)
    data = [
        {
            'id': key.id,
            'name': key.name,
            'key_prefix': key.key_prefix,
            'owner_clerk_id': key.owner_clerk_id,
            'is_active': key.is_active,
            'last_used_at': key.last_used_at,
            'created_at': key.created_at,
            'expires_at': key.expires_at,
        }
        for key in keys
    ]
    return {'success': True, 'data': data}


@router.post('/api-keys/generate/')
def create_api_key(request: HttpRequest, payload: APIKeyGenerateIn):
    admin = get_admin_user(request)
    raw_key, key_hash, key_prefix = generate_api_key()

    expires_at = None
    if payload.expires_days:
        expires_at = timezone.now() + timedelta(days=payload.expires_days)

    APIKey.objects.create(
        name=payload.name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        owner_clerk_id=admin.clerk_user_id,
        expires_at=expires_at,
    )

    return {
        'success': True,
        'data': {
            'key': raw_key,
            'prefix': key_prefix,
            'name': payload.name,
            'warning': 'Save this key now. It will never be shown again.',
        },
    }


@router.delete('/api-keys/{api_key_id}/')
def deactivate_api_key(request: HttpRequest, api_key_id: int):
    admin = get_admin_user(request)
    updated = APIKey.objects.filter(id=api_key_id, owner_clerk_id=admin.clerk_user_id).update(is_active=False)
    if not updated:
        raise NotFound(f'API key #{api_key_id} not found')
    return {'success': True, 'data': {'deactivated': True}}
