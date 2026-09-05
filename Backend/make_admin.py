import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

print("=== Nowic Studio Admin Promoter ===")
default_db = os.getenv('DATABASE_URL', '')
if default_db:
    database_url = input(f"Enter DATABASE_URL (press Enter for .env default): ").strip() or default_db
else:
    database_url = input("Enter DATABASE_URL: ").strip()

email = input("Enter the email to promote to admin: ").strip().lower()
clerk_id = input("Enter Clerk User ID (starts with user_..., optional if already in DB): ").strip()

if not database_url or not email:
    print("Error: DATABASE_URL and email are required.")
    sys.exit(1)

os.environ['DATABASE_URL'] = database_url
os.environ['SECRET_KEY'] = os.getenv('SECRET_KEY', 'temp-secret-key')
os.environ['CLERK_JWKS_URL'] = os.getenv('CLERK_JWKS_URL', 'https://clerk.nowicstudio.in')
os.environ['CLERK_WEBHOOK_SECRET'] = os.getenv('CLERK_WEBHOOK_SECRET', 'temp')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')

import django
try:
    django.setup()
except Exception as e:
    print(f"\nFailed to connect. Check your DATABASE_URL. Error: {e}")
    sys.exit(1)

from apps.users.models import UserProfile

try:
    # 1. Check if a profile exists by email
    profile = UserProfile.objects.filter(email__iexact=email).first()

    # 2. Check if a profile exists by clerk_user_id (if provided)
    if not profile and clerk_id:
        profile = UserProfile.objects.filter(clerk_user_id=clerk_id).first()

    if profile:
        profile.role = 'admin'
        profile.is_active = True
        profile.email = email
        if clerk_id:
            profile.clerk_user_id = clerk_id
        profile.save()
        print(f"\n[SUCCESS] Updated existing profile for {email} to ADMIN (Clerk ID: {profile.clerk_user_id}).")
    else:
        target_clerk_id = clerk_id or f"pending_admin_{email}"
        full_name = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
        profile = UserProfile.objects.create(
            clerk_user_id=target_clerk_id,
            email=email,
            full_name=full_name,
            role='admin',
            is_active=True
        )
        print(f"\n[SUCCESS] Created new ADMIN profile for {email} (Clerk ID: {profile.clerk_user_id}).")

    print("\nGo back to the website and refresh the Admin Portal.")
except Exception as e:
    print(f"\nError: Could not update the database. {e}")

