from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from ninja import Schema


class ProjectUpdateIn(Schema):
    title: str
    description: str
    progress: int


class ProjectFileIn(Schema):
    file_url: str
    file_name: str
    file_type: str


class InvoiceCreateIn(Schema):
    project_id: int
    amount: Decimal
    due_date: date
    notes: Optional[str] = ''


class InvoiceUpdateIn(Schema):
    paid_amount: Optional[Decimal] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ProjectUpdateOut(Schema):
    id: int
    project_id: int
    title: str
    description: str
    progress: int
    posted_by: str
    posted_at: datetime


class ProjectFileOut(Schema):
    id: int
    project_id: int
    file_url: str
    file_name: str
    file_type: str
    uploaded_by: str
    uploaded_at: datetime


class InvoiceOut(Schema):
    id: int
    project_id: int
    invoice_number: str
    amount: Decimal
    paid_amount: Decimal
    remaining_amount: Decimal
    status: str
    due_date: date
    notes: str
    created_at: datetime
    paid_at: Optional[datetime] = None
