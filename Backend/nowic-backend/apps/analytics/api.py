from datetime import date, timedelta
from decimal import Decimal
from typing import Optional

from django.db.models import Avg, Count, Sum
from django.db.models.functions import ExtractWeekDay, TruncMonth
from django.http import HttpRequest
from django.utils import timezone
from ninja import Query, Router

from apps.booking.models import Appointment
from apps.crm.models import Lead, Project
from apps.public.models import ContactSubmission
from shared.auth import clerk_auth, get_admin_user

router = Router(tags=['Analytics'], auth=clerk_auth)


def _admin(request: HttpRequest):
    return get_admin_user(request)


def _date_filters(from_date: Optional[date], to_date: Optional[date]):
    filters = {}
    if from_date:
        filters['created_at__date__gte'] = from_date
    if to_date:
        filters['created_at__date__lte'] = to_date
    return filters


def _pct_growth(current: Decimal, previous: Decimal) -> str:
    if previous == 0:
        if current == 0:
            return '0.0%'
        return '+100.0%'
    growth = ((current - previous) / previous) * 100
    sign = '+' if growth >= 0 else ''
    return f'{sign}{round(growth, 1)}%'


@router.get('/revenue/')
def revenue_analytics(
    request: HttpRequest,
    from_date: Optional[date] = Query(default=None, alias='from'),
    to_date: Optional[date] = Query(default=None, alias='to'),
):
    _admin(request)

    projects = Project.objects.filter(status='delivered').only(
        'id', 'name', 'cost', 'created_at'
    )
    if from_date:
        projects = projects.filter(created_at__date__gte=from_date)
    if to_date:
        projects = projects.filter(created_at__date__lte=to_date)

    total_revenue = projects.aggregate(total=Sum('cost'))['total'] or Decimal('0.00')
    avg_value = projects.aggregate(avg=Avg('cost'))['avg'] or Decimal('0.00')

    by_month_qs = (
        projects.annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(revenue=Sum('cost'), project_count=Count('id'))
        .order_by('month')
    )
    by_month = [
        {
            'month': row['month'].strftime('%Y-%m'),
            'revenue': str(row['revenue'] or Decimal('0.00')),
            'project_count': row['project_count'],
        }
        for row in by_month_qs
    ]

    by_service_qs = (
        projects.values('name')
        .annotate(revenue=Sum('cost'), count=Count('id'))
        .order_by('-revenue')
    )
    by_service = [
        {
            'service': row['name'],
            'revenue': str(row['revenue'] or Decimal('0.00')),
            'count': row['count'],
        }
        for row in by_service_qs
    ]

    highest = projects.order_by('-cost').only('name', 'cost').first()

    return {
        'success': True,
        'data': {
            'total_revenue': str(total_revenue),
            'by_month': by_month,
            'by_service': by_service,
            'average_project_value': str(avg_value),
            'highest_value_project': {
                'name': highest.name if highest else '',
                'cost': str(highest.cost) if highest else '0.00',
            },
        },
    }


@router.get('/leads/')
def leads_analytics(
    request: HttpRequest,
    from_date: Optional[date] = Query(default=None, alias='from'),
    to_date: Optional[date] = Query(default=None, alias='to'),
):
    _admin(request)

    leads = Lead.objects.filter(is_active=True).only(
        'id', 'status', 'source', 'created_at', 'updated_at'
    )
    if from_date:
        leads = leads.filter(created_at__date__gte=from_date)
    if to_date:
        leads = leads.filter(created_at__date__lte=to_date)

    total = leads.count()
    won_count = leads.filter(status='won').count()
    conversion_rate = (won_count / total * 100) if total else 0

    by_status_rows = leads.values('status').annotate(count=Count('id'))
    by_status = {row['status']: row['count'] for row in by_status_rows}

    by_source_rows = leads.values('source').annotate(count=Count('id')).order_by('-count')
    by_source = {row['source']: row['count'] for row in by_source_rows}
    best_source = by_source_rows[0]['source'] if by_source_rows else ''

    by_month_rows = (
        leads.annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    by_month = []
    for row in by_month_rows:
        month_leads = leads.filter(created_at__year=row['month'].year, created_at__month=row['month'].month)
        by_month.append(
            {
                'month': row['month'].strftime('%Y-%m'),
                'count': row['count'],
                'won': month_leads.filter(status='won').count(),
            }
        )

    won_durations = []
    for lead in leads.filter(status='won').only('created_at', 'updated_at'):
        won_durations.append(max(0, (lead.updated_at - lead.created_at).days))
    avg_days_to_close = round(sum(won_durations) / len(won_durations), 2) if won_durations else 0

    return {
        'success': True,
        'data': {
            'total': total,
            'conversion_rate': f'{conversion_rate:.2f}%',
            'by_status': by_status,
            'by_source': by_source,
            'by_month': by_month,
            'avg_days_to_close': avg_days_to_close,
            'best_source': best_source,
        },
    }


@router.get('/bookings/')
def bookings_analytics(
    request: HttpRequest,
    from_date: Optional[date] = Query(default=None, alias='from'),
    to_date: Optional[date] = Query(default=None, alias='to'),
):
    _admin(request)

    bookings = Appointment.objects.select_related('service').only(
        'id', 'status', 'date', 'time_slot', 'booked_at', 'service__name'
    )
    if from_date:
        bookings = bookings.filter(booked_at__date__gte=from_date)
    if to_date:
        bookings = bookings.filter(booked_at__date__lte=to_date)

    total = bookings.count()
    confirmed = bookings.filter(status='confirmed').count()
    cancelled = bookings.filter(status='cancelled').count()
    cancellation_rate = (cancelled / total * 100) if total else 0

    by_service = list(
        bookings.values('service__name').annotate(count=Count('id')).order_by('-count')
    )
    by_service = [{'service': row['service__name'], 'count': row['count']} for row in by_service]

    day_map = {1: 'Sunday', 2: 'Monday', 3: 'Tuesday', 4: 'Wednesday', 5: 'Thursday', 6: 'Friday', 7: 'Saturday'}
    day_rows = bookings.annotate(day=ExtractWeekDay('date')).values('day').annotate(count=Count('id')).order_by('day')
    by_day_of_week = [{'day': day_map.get(row['day'], 'Unknown'), 'count': row['count']} for row in day_rows]

    peak = bookings.values('time_slot').annotate(count=Count('id')).order_by('-count').first()
    peak_hour = peak['time_slot'].strftime('%H:%M') if peak else ''

    by_month_rows = (
        bookings.annotate(month=TruncMonth('booked_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    by_month = [{'month': row['month'].strftime('%Y-%m'), 'count': row['count']} for row in by_month_rows]

    return {
        'success': True,
        'data': {
            'total': total,
            'confirmed': confirmed,
            'cancelled': cancelled,
            'cancellation_rate': f'{cancellation_rate:.2f}%',
            'by_service': by_service,
            'by_day_of_week': by_day_of_week,
            'peak_hour': peak_hour,
            'by_month': by_month,
        },
    }


@router.get('/growth/')
def growth_analytics(request: HttpRequest):
    _admin(request)

    now = timezone.now()
    today = now.date()
    week_start = today - timedelta(days=today.weekday())
    last_week_start = week_start - timedelta(days=7)
    month_start = today.replace(day=1)
    last_month_end = month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)

    leads_this_week = Lead.objects.filter(created_at__date__gte=week_start, is_active=True).count()
    leads_last_week = Lead.objects.filter(created_at__date__gte=last_week_start, created_at__date__lt=week_start, is_active=True).count()
    leads_this_month = Lead.objects.filter(created_at__date__gte=month_start, is_active=True).count()
    leads_last_month = Lead.objects.filter(created_at__date__gte=last_month_start, created_at__date__lte=last_month_end, is_active=True).count()

    bookings_this_week = Appointment.objects.filter(booked_at__date__gte=week_start).count()
    bookings_last_week = Appointment.objects.filter(booked_at__date__gte=last_week_start, booked_at__date__lt=week_start).count()
    bookings_this_month = Appointment.objects.filter(booked_at__date__gte=month_start).count()
    bookings_last_month = Appointment.objects.filter(booked_at__date__gte=last_month_start, booked_at__date__lte=last_month_end).count()

    contacts_this_week = ContactSubmission.objects.filter(submitted_at__date__gte=week_start).count()
    contacts_last_week = ContactSubmission.objects.filter(submitted_at__date__gte=last_week_start, submitted_at__date__lt=week_start).count()
    contacts_this_month = ContactSubmission.objects.filter(submitted_at__date__gte=month_start).count()
    contacts_last_month = ContactSubmission.objects.filter(submitted_at__date__gte=last_month_start, submitted_at__date__lte=last_month_end).count()

    revenue_this_week = Project.objects.filter(status='delivered', created_at__date__gte=week_start).aggregate(total=Sum('cost'))['total'] or Decimal('0.00')
    revenue_last_week = Project.objects.filter(status='delivered', created_at__date__gte=last_week_start, created_at__date__lt=week_start).aggregate(total=Sum('cost'))['total'] or Decimal('0.00')
    revenue_this_month = Project.objects.filter(status='delivered', created_at__date__gte=month_start).aggregate(total=Sum('cost'))['total'] or Decimal('0.00')
    revenue_last_month = Project.objects.filter(status='delivered', created_at__date__gte=last_month_start, created_at__date__lte=last_month_end).aggregate(total=Sum('cost'))['total'] or Decimal('0.00')

    return {
        'success': True,
        'data': {
            'leads': {
                'this_week': leads_this_week,
                'last_week': leads_last_week,
                'wow_growth': _pct_growth(Decimal(leads_this_week), Decimal(leads_last_week)),
                'this_month': leads_this_month,
                'last_month': leads_last_month,
                'mom_growth': _pct_growth(Decimal(leads_this_month), Decimal(leads_last_month)),
            },
            'bookings': {
                'this_week': bookings_this_week,
                'last_week': bookings_last_week,
                'wow_growth': _pct_growth(Decimal(bookings_this_week), Decimal(bookings_last_week)),
                'this_month': bookings_this_month,
                'last_month': bookings_last_month,
                'mom_growth': _pct_growth(Decimal(bookings_this_month), Decimal(bookings_last_month)),
            },
            'contacts': {
                'this_week': contacts_this_week,
                'last_week': contacts_last_week,
                'wow_growth': _pct_growth(Decimal(contacts_this_week), Decimal(contacts_last_week)),
                'this_month': contacts_this_month,
                'last_month': contacts_last_month,
                'mom_growth': _pct_growth(Decimal(contacts_this_month), Decimal(contacts_last_month)),
            },
            'revenue': {
                'this_week': str(revenue_this_week),
                'last_week': str(revenue_last_week),
                'wow_growth': _pct_growth(revenue_this_week, revenue_last_week),
                'this_month': str(revenue_this_month),
                'last_month': str(revenue_last_month),
                'mom_growth': _pct_growth(revenue_this_month, revenue_last_month),
            },
        },
    }


@router.get('/overview/')
def analytics_overview(
    request: HttpRequest,
    from_date: Optional[date] = Query(default=None, alias='from'),
    to_date: Optional[date] = Query(default=None, alias='to'),
):
    _admin(request)
    revenue = revenue_analytics(request, from_date=from_date, to_date=to_date)
    leads = leads_analytics(request, from_date=from_date, to_date=to_date)
    bookings = bookings_analytics(request, from_date=from_date, to_date=to_date)
    growth = growth_analytics(request)
    return {
        'success': True,
        'data': {
            'revenue': revenue.get('data', {}),
            'leads': leads.get('data', {}),
            'bookings': bookings.get('data', {}),
            'growth': growth.get('data', {}),
        },
    }
