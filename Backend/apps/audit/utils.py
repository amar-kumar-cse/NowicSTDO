from apps.audit.models import AuditLog


def log_action(
    actor_clerk_id,
    action,
    resource_type,
    resource_id,
    old_value=None,
    new_value=None,
    ip=None,
    user_agent=None,
    actor_email='',
):
    return AuditLog.objects.create(
        actor_clerk_id=actor_clerk_id,
        actor_email=actor_email,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id),
        old_value=old_value,
        new_value=new_value,
        ip_address=ip,
        user_agent=user_agent or '',
    )
