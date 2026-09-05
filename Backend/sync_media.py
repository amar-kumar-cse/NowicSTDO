import os
import sys
from pathlib import Path
import django

# Set up Django environment using base settings (which defaults to Cloudinary)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from django.core.files.storage import default_storage
from django.core.files import File

BASE_DIR = Path(__file__).resolve().parent
local_media_dir = BASE_DIR / 'media'

if not local_media_dir.exists():
    print("Local media directory not found!")
    sys.exit(1)

print("Starting media upload to Cloudinary...")
uploaded_count = 0

for root, dirs, files in os.walk(local_media_dir):
    for file in files:
        local_file_path = Path(root) / file
        # Relative path from media directory (e.g., services/095eb4a8ae9e.jpg)
        relative_path = local_file_path.relative_to(local_media_dir)
        # Convert path to forward slashes for django/Cloudinary storage
        storage_name = str(relative_path).replace('\\', '/')
        
        print(f"Uploading {storage_name}...")
        try:
            if default_storage.exists(storage_name):
                print(f"File {storage_name} already exists on Cloudinary. Skipping.")
                continue
            
            with open(local_file_path, 'rb') as f:
                django_file = File(f)
                default_storage.save(storage_name, django_file)
            print(f"Successfully uploaded {storage_name}!")
            uploaded_count += 1
        except Exception as e:
            print(f"Failed to upload {storage_name}: {e}")

print(f"\nMedia upload completed! Total uploaded: {uploaded_count}")
