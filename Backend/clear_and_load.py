import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from django.apps import apps
from django.core.management import call_command

print("Cleaning existing tables to avoid unique constraint duplicates...")
app_names = ['users', 'public', 'booking', 'crm', 'client', 'notifications', 'analytics', 'audit', 'apikeys']
for app_name in app_names:
    try:
        app_config = apps.get_app_config(app_name)
        for model in app_config.get_models():
            count = model.objects.all().count()
            if count > 0:
                print(f"  Deleting {count} record(s) from {model.__name__}...")
                model.objects.all().delete()
    except Exception as e:
        print(f"  Skipping app {app_name}: {e}")

print("\nLoading datadump.json...")
try:
    call_command('loaddata', 'datadump.json')
    print("Database sync completed successfully!")
except Exception as e:
    print(f"Failed to load database dump: {e}")
