"""
apps/public/schemas.py

Pydantic/Ninja schemas for the public-facing API.
"""
from typing import Optional, List, Any
from decimal import Decimal
from datetime import datetime
from ninja import Schema


class ServiceOfferingOut(Schema):
    id: int
    name: str
    slug: str
    tagline: str
    description: str
    features: list
    icon_name: str
    price_starting: Optional[Decimal] = None
    delivery_days: Optional[int] = None
    is_active: bool
    order: int
    inquiry_count: int = 0


class ContactServiceInterestOut(Schema):
    name: str
    slug: str
    price_starting: Optional[Decimal] = None


class PortfolioProjectOut(Schema):
    id: int
    title: str
    slug: str
    category: str
    description: str
    tech_stack: list
    image_url: str = ''
    live_url: str
    github_url: str
    is_featured: bool
    order: int
    created_at: datetime


class ContactIn(Schema):
    name: str
    email: str
    project_type: Optional[str] = None
    message: str
    phone: Optional[str] = None
    budget: Optional[str] = None
    service_slug: Optional[str] = None


class ContactOut(Schema):
    id: int
    name: str
    email: str
    project_type: str
    message: str
    phone: str
    budget: str
    submitted_at: datetime
    status: str
    priority: str
    replied_at: Optional[datetime] = None
    reply_note: str
    service_interest: Optional[ContactServiceInterestOut] = None


class ContactAdminOut(Schema):
    id: int
    name: str
    email: str
    project_type: str
    message: str
    phone: str
    budget: str
    status: str
    priority: str
    replied_at: Optional[datetime] = None
    reply_note: str
    ip_address: Optional[str] = None
    submitted_at: datetime
    service_interest: Optional[ContactServiceInterestOut] = None


class ServiceOut(ServiceOfferingOut):
    pass


class StatsOut(Schema):
    projects_delivered: int
    happy_clients: int
    services_offered: int
    team_members: int


class SiteContentOut(Schema):
    section: str
    data: Any
    updated_at: datetime
