import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from apps.public.models import SiteContent

json_path = r'C:\Users\Asus\Desktop\NowicME\NowicSTDO\Backend\mapped_services.json'
with open(json_path, 'r', encoding='utf-8') as f:
    mapped_services = json.load(f)

site_content = SiteContent.objects.get(section='services')
existing_services = site_content.data

for existing in existing_services:
    new_data = next((m for m in mapped_services if m['slug'] == existing['slug']), None)
    if new_data:
        existing['heroContent'] = new_data.get('heroContent')
        existing['introduction'] = new_data.get('introduction')
        existing['subServices'] = new_data.get('subServices')
        existing['process'] = new_data.get('process')
        existing['whyChooseUs'] = new_data.get('whyChooseUs')
        existing['faqs'] = new_data.get('faqs')

site_content.data = existing_services
site_content.save()
print("Successfully updated Django SiteContent with real data!")
