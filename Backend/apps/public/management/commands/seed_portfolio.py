import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.public.models import PortfolioProject
from apps.public import sitemap

PROJECTS = [
    {
        'title': 'Event Ticket Booking System',
        'slug': 'event-ticket-booking',
        'category': 'saas',
        'description': 'Full-stack ticketing platform with payments and admin dashboard.',
        'tech_stack': ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        'live_url': '',
        'github_url': '',
        'is_featured': True,
    },
    {
        'title': 'Catering Services Website',
        'slug': 'catering-website',
        'category': 'website',
        'description': 'Marketing website with CMS, menus, and booking flow.',
        'tech_stack': ['React', 'Vite', 'Tailwind CSS'],
        'is_featured': False,
    },
    {
        'title': 'Siya AI Assistant Platform',
        'slug': 'siya-ai',
        'category': 'ai_app',
        'description': 'AI assistant platform with LLMs, dashboards, and user management.',
        'tech_stack': ['OpenAI', 'Django', 'React', 'pgvector'],
        'is_featured': True,
    },
    {
        'title': 'BloodConnect Healthcare Platform',
        'slug': 'bloodconnect',
        'category': 'website',
        'description': 'Healthcare platform with mapping and donor workflows.',
        'tech_stack': ['React', 'MongoDB', 'Maps API'],
        'is_featured': False,
    },
]


class Command(BaseCommand):
    help = 'Seed portfolio projects and regenerate sitemap (idempotent).'

    def handle(self, *args, **options):
        created = 0
        for idx, p in enumerate(PROJECTS):
            slug = slugify(p['slug'])
            obj, was_created = PortfolioProject.objects.get_or_create(
                slug=slug,
                defaults={
                    'title': p['title'],
                    'category': p['category'],
                    'description': p['description'],
                    'tech_stack': p.get('tech_stack', []),
                    'is_featured': p.get('is_featured', False),
                    'order': idx + 1,
                },
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"Created project: {obj.slug}"))

        if created == 0:
            self.stdout.write('No new projects created (already present).')

        # regenerate sitemap
        try:
            xml = sitemap.generate_sitemap_xml()
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
            target = os.path.join(base_dir, 'frontend', 'public', 'sitemap.xml')
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, 'w', encoding='utf-8') as fh:
                fh.write(xml)
            self.stdout.write(self.style.SUCCESS(f'Regenerated sitemap at {target}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to regenerate sitemap: {e}'))
