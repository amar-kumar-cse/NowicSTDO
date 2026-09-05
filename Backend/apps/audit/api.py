from datetime import date, datetime, time
from typing import Optional

from django.http import HttpRequest
from ninja import Query, Router

from apps.audit.models import AuditLog
from shared.auth import clerk_auth, get_admin_user
from shared.pagination import paginate

router = Router(tags=['Audit'], auth=clerk_auth)


@router.get('/audit-logs/')
def list_audit_logs(
    request: HttpRequest,
    action: Optional[str] = Query(default=None),
    actor: Optional[str] = Query(default=None),
    from_date: Optional[date] = Query(default=None, alias='from'),
    to_date: Optional[date] = Query(default=None, alias='to'),
    resource_type: Optional[str] = Query(default=None),
    page: int = Query(default=1),
    page_size: int = Query(default=20),
):
    get_admin_user(request)

    qs = AuditLog.objects.only(
        'id', 'actor_clerk_id', 'actor_email', 'action', 'resource_type', 'resource_id',
        'old_value', 'new_value', 'ip_address', 'user_agent', 'timestamp'
    )

    if action:
        qs = qs.filter(action=action)
    if actor:
        qs = qs.filter(actor_clerk_id=actor)
    if resource_type:
        qs = qs.filter(resource_type=resource_type)
    if from_date:
        qs = qs.filter(timestamp__gte=datetime.combine(from_date, time.min))
    if to_date:
        qs = qs.filter(timestamp__lte=datetime.combine(to_date, time.max))

    return paginate(
        qs,
        page=page,
        page_size=page_size,
        fields=[
            'id', 'actor_clerk_id', 'actor_email', 'action', 'resource_type', 'resource_id',
            'old_value', 'new_value', 'ip_address', 'user_agent', 'timestamp'
        ],
    )
