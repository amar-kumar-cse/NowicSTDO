from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db.models import Sum
from django.utils import timezone

from apps.analytics.models import DailySnapshot
from apps.booking.models import Appointment
from apps.crm.models import Lead, Project
from apps.public.models import ContactSubmission


class Command(BaseCommand):
    help = 'Create or update daily analytics snapshot for today.'

    def handle(self, *args, **options):
        today = timezone.localdate()

        defaults = {
            'new_leads': Lead.objects.filter(created_at__date=today, is_active=True).count(),
            'leads_won': Lead.objects.filter(created_at__date=today, is_active=True, status='won').count(),
            'new_bookings': Appointment.objects.filter(booked_at__date=today).count(),
            'new_contacts': ContactSubmission.objects.filter(submitted_at__date=today).count(),
            'revenue_earned': Project.objects.filter(status='delivered', created_at__date=today).aggregate(
                total=Sum('cost')
            )['total'] or Decimal('0.00'),
        }

        snapshot, created = DailySnapshot.objects.update_or_create(date=today, defaults=defaults)
        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f'{action} daily snapshot for {snapshot.date}'))
