import os
import sys
from pathlib import Path
import django

print("=== Nowic Studio Render Sync Tool ===")
print("Please enter your Production/Render details to sync your local data.\n")

# Prompt for credentials
cloud_name = input("Enter CLOUDINARY_CLOUD_NAME: ").strip()
api_key = input("Enter CLOUDINARY_API_KEY: ").strip()
api_secret = input("Enter CLOUDINARY_API_SECRET: ").strip()
database_url = input("Enter production DATABASE_URL: ").strip()

# Check values
if not all([cloud_name, api_key, api_secret, database_url]):
    print("Error: All fields are required to sync.")
    sys.exit(1)

# Inject into environment
os.environ['CLOUDINARY_CLOUD_NAME'] = cloud_name
os.environ['CLOUDINARY_API_KEY'] = api_key
os.environ['CLOUDINARY_API_SECRET'] = api_secret
os.environ['DATABASE_URL'] = database_url

# Force Django to use production/base configuration
os.environ['SECRET_KEY'] = 'temp-secret-key-for-sync'
os.environ['CLERK_JWKS_URL'] = 'https://clerk.nowicstudio.in' # Dummy/temp for sync
os.environ['CLERK_WEBHOOK_SECRET'] = 'temp'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')

# Initialize Django
try:
    django.setup()
except Exception as e:
    print(f"\nFailed to initialize Django settings. Check your DATABASE_URL or environment. Error: {e}")
    sys.exit(1)

from django.core.files.storage import default_storage
from django.core.files import File
from django.core.management import call_command

# 1. Upload Media
BASE_DIR = Path(__file__).resolve().parent
local_media_dir = BASE_DIR / 'media'

if local_media_dir.exists():
    print("\n[1/2] Starting media upload to Cloudinary...")
    uploaded_count = 0
    for root, dirs, files in os.walk(local_media_dir):
        for file in files:
            local_file_path = Path(root) / file
            relative_path = local_file_path.relative_to(local_media_dir)
            storage_name = str(relative_path).replace('\\', '/')
            
            print(f"  Uploading {storage_name}...")
            try:
                if default_storage.exists(storage_name):
                    print(f"  File {storage_name} already exists. Skipping.")
                    continue
                with open(local_file_path, 'rb') as f:
                    default_storage.save(storage_name, File(f))
                print(f"  Successfully uploaded {storage_name}!")
                uploaded_count += 1
            except Exception as e:
                print(f"  Failed to upload {storage_name}: {e}")
    print(f"Media upload finished. Total uploaded: {uploaded_count}")
else:
    print("\n[1/2] No local media directory found, skipping image uploads.")

# 2. Sync Database & Migrations
print("\n[2/3] Running database migrations...")
try:
    call_command('migrate')
    print("Database migrations applied successfully!")
except Exception as e:
    print(f"Warning/Failed during migrations: {e}")

print("\n[3/3] Loading database dump into live database...")
try:
    call_command('loaddata', 'datadump.json')
    print("\nDatabase sync completed successfully!")
except Exception as e:
    print(f"\nFailed to load database dump: {e}")
