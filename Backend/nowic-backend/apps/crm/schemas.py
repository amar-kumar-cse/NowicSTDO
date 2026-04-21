"""
apps/crm/schemas.py

Pydantic/Ninja schemas for the CRM API.
"""
from typing import Optional
from decimal import Decimal
from datetime import datetime, date
from ninja import Schema


# ─── Lead ────────────────────────────────────────────────────────────────────

class LeadIn(Schema):
    company_name: str
    founder_name: str
    email: str
    phone: Optional[str] = ""
    source: str
    status: Optional[str] = "sent"
    notes: Optional[str] = ""


class LeadOut(Schema):
    id: int
    company_name: str
    founder_name: str
    email: str
    phone: str
    source: str
    status: str
    notes: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class LeadStatusUpdate(Schema):
    status: str


class LeadUpdate(Schema):
    company_name: Optional[str] = None
    founder_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


# ─── Project ─────────────────────────────────────────────────────────────────

class ProjectOut(Schema):
    id: int
    name: str
    deadline: date
    cost: Decimal
    progress: int
    status: str
    created_at: datetime


class ProjectStatusUpdate(Schema):
    progress: Optional[int] = None
    status: Optional[str] = None


# ─── CRM Stats ───────────────────────────────────────────────────────────────

class LeadsByStatus(Schema):
    sent: int = 0
    reply: int = 0
    follow_up: int = 0
    closed: int = 0
    won: int = 0


class LeadsStats(Schema):
    total: int
    by_status: dict
    this_month: int


class ProjectsStats(Schema):
    total: int
    in_progress: int
    delivered: int
    total_revenue: str


class BookingsStats(Schema):
    total: int
    this_month: int
    pending: int


class SubmissionsStats(Schema):
    total: int
    unread: int


class CRMStatsOut(Schema):
    leads: LeadsStats
    projects: ProjectsStats
    bookings: BookingsStats
    submissions: SubmissionsStats


# ─── Submission status update ─────────────────────────────────────────────────

class SubmissionStatusUpdate(Schema):
    status: str
