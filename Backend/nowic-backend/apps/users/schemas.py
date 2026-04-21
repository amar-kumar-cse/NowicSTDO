"""
apps/users/schemas.py

Pydantic/Ninja schemas for the users app.
"""
from typing import Optional
from datetime import datetime
from ninja import Schema


class UserProfileOut(Schema):
    id: int
    clerk_user_id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class ClerkEmailAddress(Schema):
    email_address: str
    id: str


class ClerkWebhookData(Schema):
    id: str
    email_addresses: list[ClerkEmailAddress] = []
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    primary_email_address_id: Optional[str] = None


class ClerkWebhookPayload(Schema):
    type: str
    data: ClerkWebhookData
