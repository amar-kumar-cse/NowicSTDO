from celery import shared_task


@shared_task
def snapshot_today():
    from django.core.management import call_command

    call_command('snapshot_today')
    return 'Snapshot created'
