from pathlib import Path
import json

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.public.models import SiteContent


class Command(BaseCommand):
    help = 'Seed site content sections from Backend/seed/site_content/*.json'

    def handle(self, *args, **options):
        base = Path(settings.BASE_DIR) / 'seed' / 'site_content'
        tech_file = base / 'technologies.json'

        if not tech_file.exists():
            msg = f"Seed file not found: {tech_file}"
            self.stderr.write(msg)
            raise CommandError(msg)

        with tech_file.open('r', encoding='utf-8') as fh:
            data = json.load(fh)

        # create or update
        obj, created = SiteContent.objects.update_or_create(
            section='technologies',
            defaults={'data': data},
        )

        if created:
            self.stdout.write(self.style.SUCCESS('Created SiteContent section=technologies'))
        else:
            self.stdout.write(self.style.SUCCESS('Updated SiteContent section=technologies'))
