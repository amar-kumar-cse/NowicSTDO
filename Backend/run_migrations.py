import os
import sys
import django
from django.core.management import call_command

print("=== Nowic Studio Production Database Migrator ===")
database_url = input("Enter production DATABASE_URL: ").strip()

if not database_url:
    print("Error: DATABASE_URL is required.")
    sys.exit(1)

os.environ['DATABASE_URL'] = database_url
from django.core.management.utils import get_random_secret_key
os.environ['SECRET_KEY'] = get_random_secret_key()
os.environ['CLERK_JWKS_URL'] = 'https://clerk.nowicstudio.in'
os.environ['CLERK_WEBHOOK_SECRET'] = 'temp'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')

try:
    django.setup()
    print("\nConnected to database successfully. Running migrations...")
    call_command('migrate')
    print("\n✅ Migrations completed successfully! The BlogPost and all new tables are now created.")
except Exception as e:
    print(f"\n❌ Migration failed: {e}")
