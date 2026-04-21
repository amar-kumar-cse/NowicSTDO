from datetime import datetime
from typing import Optional

from ninja import Schema


class NotificationOut(Schema):
    id: int
    notification_type: str
    title: str
    message: str
    data: dict
    is_read: bool
    created_at: datetime


class NotificationFilterIn(Schema):
    is_read: Optional[bool] = None
