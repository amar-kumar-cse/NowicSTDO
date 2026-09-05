from celery import shared_task


@shared_task
def send_followup_reminders():
    from django.core.management import call_command

    call_command('send_followup_reminders')
    return 'Done'


@shared_task
def send_bulk_email_task(lead_ids, subject, body):
    from apps.crm.models import Lead
    from shared.email import send_bulk_lead_email

    leads = Lead.objects.filter(id__in=lead_ids, is_active=True).only('id', 'email', 'founder_name')
    for lead in leads:
        send_bulk_lead_email(lead.email, lead.founder_name, subject, body)
    return f'Sent to {leads.count()} leads'
