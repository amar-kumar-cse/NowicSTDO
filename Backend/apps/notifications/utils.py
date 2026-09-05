from apps.notifications.models import Notification


def create_notification(recipient_clerk_id, notif_type, title, message, data=None):
    return Notification.objects.create(
        recipient_clerk_id=recipient_clerk_id,
        notification_type=notif_type,
        title=title,
        message=message,
        data=data or {},
    )


def notify_all_admins(notif_type, title, message, data=None):
    from apps.users.models import UserProfile

    admins = UserProfile.objects.filter(role='admin', is_active=True).only('clerk_user_id')
    for admin in admins:
        create_notification(admin.clerk_user_id, notif_type, title, message, data)
