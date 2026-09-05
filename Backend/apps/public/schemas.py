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
    website: Optional[str] = None  # Honeypot field


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


class ReviewIn(Schema):
    client_name: str
    company: Optional[str] = None
    role: Optional[str] = None
    rating: int
    review_text: str
    avatar_url: Optional[str] = None


class ReviewOut(Schema):
    id: int
    client_name: str
    company: Optional[str] = None
    role: Optional[str] = None
    rating: int
    review_text: str
    is_approved: bool
    avatar_url: Optional[str] = None
    created_at: datetime


class BlogPostOut(Schema):
    id: int
    title: str
    slug: str
    excerpt: str = ''
    content: str = ''
    cover_image_url: Optional[str] = ''
    is_published: bool = False
    read_time_minutes: int = 5
    views_count: int = 0
    created_at: datetime
    updated_at: datetime


class BlogPostIn(Schema):
    title: str
    slug: str
    excerpt: Optional[str] = ""
    content: str
    cover_image_url: Optional[str] = None
    is_published: Optional[bool] = False
    read_time_minutes: Optional[int] = 5


class BlogPostUpdateIn(Schema):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = None
    read_time_minutes: Optional[int] = None
