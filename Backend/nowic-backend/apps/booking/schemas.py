"""
apps/booking/schemas.py

Pydantic/Ninja schemas for the booking API.
"""
from typing import Optional, List
from decimal import Decimal
from datetime import date, time, datetime
from ninja import Schema


class BookingServiceOut(Schema):
    id: int
    name: str
    slug: str
    price: Decimal
    duration_minutes: int
    description: str
    is_active: bool


class AppointmentIn(Schema):
    service_id: int
    date: date
    time_slot: time


class AppointmentOut(Schema):
    id: int
    clerk_user_id: str
    service_id: int
    date: date
    time_slot: time
    status: str
    cancellation_reason: str
    booked_at: datetime


class SlotsQuery(Schema):
    date: date
    service_id: int


class CancelIn(Schema):
    reason: Optional[str] = ""


class AvailableSlotsOut(Schema):
    date: str
    available: List[str]
