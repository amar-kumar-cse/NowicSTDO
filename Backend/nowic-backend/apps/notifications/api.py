from typing import Optional
import json
import time

from django.http import HttpRequest
from django.http import StreamingHttpResponse
from ninja import Query, Router

from apps.notifications.models import Notification
from apps.notifications.schemas import NotificationOut
from shared.auth import clerk_auth
from shared.exceptions import NotFound
from shared.pagination import paginate

router = Router(tags=['Notifications'], auth=clerk_auth)


@router.get('/')
def list_notifications(
    request: HttpRequest,
    is_read: Optional[bool] = Query(default=None),
    page: int = Query(default=1),
    page_size: int = Query(default=20),
):
    clerk_user_id = request.auth
    qs = Notification.objects.filter(recipient_clerk_id=clerk_user_id).only(
        'id', 'notification_type', 'title', 'message', 'data', 'is_read', 'created_at'
    )
    if is_read is not None:
        qs = qs.filter(is_read=is_read)

    result = paginate(
        qs,
        page=page,
        page_size=page_size,
        serializer=lambda n: NotificationOut.from_orm(n).dict(),
    )
    result['unread_count'] = Notification.objects.filter(
        recipient_clerk_id=clerk_user_id,
        is_read=False,
    ).count()
    return result


@router.patch('/{notification_id}/read/')
def mark_notification_read(request: HttpRequest, notification_id: int):
    clerk_user_id = request.auth
    try:
        notification = Notification.objects.only('id', 'recipient_clerk_id', 'is_read').get(id=notification_id)
    except Notification.DoesNotExist:
        raise NotFound(f'Notification #{notification_id} not found')

    if notification.recipient_clerk_id != clerk_user_id:
        raise NotFound(f'Notification #{notification_id} not found')

    notification.is_read = True
    notification.save(update_fields=['is_read'])
    return {'success': True, 'data': {'id': notification_id, 'is_read': True}}


@router.post('/mark-all-read/')
def mark_all_read(request: HttpRequest):
    clerk_user_id = request.auth
    marked_count = Notification.objects.filter(
        recipient_clerk_id=clerk_user_id,
        is_read=False,
    ).update(is_read=True)
    return {'success': True, 'data': {'marked_count': marked_count}}


@router.delete('/{notification_id}/')
def delete_notification(request: HttpRequest, notification_id: int):
    clerk_user_id = request.auth
    deleted, _ = Notification.objects.filter(
        id=notification_id,
        recipient_clerk_id=clerk_user_id,
    ).delete()
    if not deleted:
        raise NotFound(f'Notification #{notification_id} not found')
    return {'success': True, 'data': {'deleted': True}}


@router.get('/unread-count/')
def unread_count(request: HttpRequest):
    clerk_user_id = request.auth
    count = Notification.objects.filter(recipient_clerk_id=clerk_user_id, is_read=False).count()
    return {'success': True, 'data': {'count': count}}


@router.get('/stream/')
def notifications_stream(request: HttpRequest):
    clerk_user_id = request.auth

    def event_stream():
        last_id = 0
        while True:
            latest = Notification.objects.filter(recipient_clerk_id=clerk_user_id).only('id').first()
            latest_id = latest.id if latest else 0
            if latest_id and latest_id > last_id:
                unread = Notification.objects.filter(recipient_clerk_id=clerk_user_id, is_read=False).count()
                payload = {'unread_count': unread, 'latest_id': latest_id}
                yield f"event: notification\ndata: {json.dumps(payload)}\n\n"
                last_id = latest_id
            else:
                yield 'event: ping\ndata: {}\n\n'
            time.sleep(10)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response
