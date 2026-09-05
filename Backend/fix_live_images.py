import os
import sys
from pathlib import Path
import django

print("=== Nowic Studio Live Image Fixer ===")
print("Please enter your Production/Render details to fix live images.\n")

# Prompt for credentials
cloud_name = input("Enter CLOUDINARY_CLOUD_NAME: ").strip()
database_url = input("Enter production DATABASE_URL: ").strip()

if not all([cloud_name, database_url]):
    print("Error: CLOUDINARY_CLOUD_NAME and DATABASE_URL are required.")
    sys.exit(1)

# Inject into environment
os.environ['CLOUDINARY_CLOUD_NAME'] = cloud_name
# We only need cloud_name to generate URLs
os.environ['CLOUDINARY_API_KEY'] = 'dummy'
os.environ['CLOUDINARY_API_SECRET'] = 'dummy'
os.environ['DATABASE_URL'] = database_url
os.environ['SECRET_KEY'] = 'temp-secret-key'
os.environ['CLERK_JWKS_URL'] = 'https://clerk.nowicstudio.in'
os.environ['CLERK_WEBHOOK_SECRET'] = 'temp'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')

try:
    django.setup()
except Exception as e:
    print(f"\nFailed to connect. Check your DATABASE_URL. Error: {e}")
    sys.exit(1)

from apps.public.models import SiteContent
import cloudinary.utils

def main():
    print("\nConnecting to live database and fixing image paths...")
    count = 0
    for content in SiteContent.objects.all():
        changed = False
        
        def convert_item(item):
            nonlocal changed
            if isinstance(item, dict):
                return {k: convert_item(v) for k, v in item.items()}
            elif isinstance(item, list):
                return [convert_item(i) for i in item]
            elif isinstance(item, str):
                if item.startswith('/media/'):
                    relative_path = item.replace('/media/', '')
                    try:
                        url, _ = cloudinary.utils.cloudinary_url(relative_path)
                        changed = True
                        return url
                    except Exception:
                        pass
            return item

        new_data = convert_item(content.data)
        if changed:
            content.data = new_data
            content.save(update_fields=['data'])
            count += 1
            print(f"Fixed section: {content.section}")

    print(f"\nSuccessfully fixed images in {count} sections on live database!")
    print("Refresh your live website now.")

if __name__ == '__main__':
    main()
