import os
from django.core.management.base import BaseCommand

from apps.public import sitemap


class Command(BaseCommand):
    help = "Generate a static sitemap.xml file in the frontend/public directory."

    def handle(self, *args, **options):
        xml = sitemap.generate_sitemap_xml()

        # Compute frontend/public path relative to this file
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".."))
        # base_dir should resolve to the repository root (NowicSTDO)
        target = os.path.join(base_dir, "frontend", "public", "sitemap.xml")

        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as fh:
            fh.write(xml)

        self.stdout.write(self.style.SUCCESS(f"Wrote sitemap to {target}"))
