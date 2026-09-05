import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from django.core.files.storage import default_storage
from apps.public.models import SiteContent

def convert_item(item):
    if isinstance(item, dict):
        return {k: convert_item(v) for k, v in item.items()}
    elif isinstance(item, list):
        return [convert_item(i) for i in item]
    elif isinstance(item, str):
        if item.startswith('/media/'):
            # Convert /media/services/xxx.png to services/xxx.png
            relative_path = item.replace('/media/', '')
            try:
                # Get the Cloudinary URL
                cloudinary_url = default_storage.url(relative_path)
                print(f"Converting local path: {item} -> {cloudinary_url}")
                return cloudinary_url
            except Exception as e:
                print(f"Failed to get URL for {relative_path}: {e}")
                return item
        return item
    return item

print("Starting SiteContent local path conversion to Cloudinary...")
updated_count = 0

for content in SiteContent.objects.all():
    original_data = content.data
    new_data = convert_item(original_data)
    if new_data != original_data:
        content.data = new_data
        content.save()
        print(f"Successfully updated section: {content.section}")
        updated_count += 1

print(f"\nPath conversion completed. Updated sections: {updated_count}")
