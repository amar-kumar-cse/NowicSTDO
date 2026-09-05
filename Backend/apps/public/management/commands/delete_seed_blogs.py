"""
Management command: delete_seed_blogs

Removes the hardcoded seed blog posts that were inserted via seed_blogs.py,
so only blogs written through the admin CMS remain visible.

Usage:
    python manage.py delete_seed_blogs          # dry-run (shows what would be deleted)
    python manage.py delete_seed_blogs --yes    # actually delete
"""
from django.core.management.base import BaseCommand

from apps.public.models import BlogPost

# Slugs sourced from seed_blogs.py (all hardcoded/default posts)
SEED_SLUGS = [
    "one-page-product-brief-template",
    "when-to-choose-postgresql-pgvector",
    "designing-admin-dashboards-for-non-technical-users",
    "building-reliable-rag-pipelines",
    "technical-seo-for-react-spas",
    "business-website-vs-saas",
    "integrating-ai-into-your-product",
    "launching-mvp-fast",
    "how-much-does-mvp-development-cost-in-2026",
    "idea-to-launch-mvp-development-process",
]


class Command(BaseCommand):
    help = "Deletes hardcoded seed blog posts so only admin-CMS blogs remain."

    def add_arguments(self, parser):
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Actually delete (default is a dry-run listing).",
        )

    def handle(self, *args, **options):
        qs = BlogPost.objects.filter(slug__in=SEED_SLUGS)
        found = list(qs.values_list("slug", flat=True))

        if not found:
            self.stdout.write(self.style.SUCCESS("No seed blog posts found. Nothing to do."))
            return

        for slug in found:
            self.stdout.write(f"  - {slug}")

        if not options["yes"]:
            self.stdout.write(self.style.WARNING(
                f"{len(found)} seed post(s) matched. Re-run with --yes to delete them."
            ))
            return

        deleted, _ = qs.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} seed blog post(s)."))
