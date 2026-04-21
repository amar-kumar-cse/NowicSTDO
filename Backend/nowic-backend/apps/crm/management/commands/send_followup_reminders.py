from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.crm.models import Lead
from apps.notifications.utils import notify_all_admins
from shared.email import send_followup_needed_email


class Command(BaseCommand):
    help = 'Send reminders for stale follow-up leads (7+ days without updates).'

    def handle(self, *args, **options):
        threshold = timezone.now() - timedelta(days=7)
        stale_leads = Lead.objects.filter(
            status='follow_up',
            updated_at__lt=threshold,
            is_active=True,
        ).only('id', 'company_name', 'founder_name', 'email', 'phone', 'updated_at', 'notes')

        sent_count = 0
        for lead in stale_leads:
            days_since_update = max(0, (timezone.now() - lead.updated_at).days)

            send_followup_needed_email(
                admin_email=settings.ADMIN_EMAIL,
                company_name=lead.company_name,
                founder_name=lead.founder_name,
                email=lead.email,
                phone=lead.phone,
                days_since_update=days_since_update,
                notes=lead.notes,
            )

            notify_all_admins(
                'follow_up_reminder',
                f'Follow up with {lead.company_name}',
                'No update in 7+ days',
                {'lead_id': lead.id, 'days_since_update': days_since_update},
            )
            sent_count += 1

        self.stdout.write(self.style.SUCCESS(f'Sent {sent_count} follow-up reminders'))
