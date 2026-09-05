import os
import sys
import json
import django

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.base")
django.setup()

from apps.public.models import SiteContent

frontend_pricing_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'pricing_export.json')

with open(frontend_pricing_file, 'r', encoding='utf-8') as f:
    pricing_data = json.load(f)

# Insert or update in SiteContent
obj, created = SiteContent.objects.update_or_create(
    section="pricingData",
    defaults={'data': pricing_data}
)

if created:
    print("Successfully created pricingData section in DB.")
else:
    print("Successfully updated pricingData section in DB.")
