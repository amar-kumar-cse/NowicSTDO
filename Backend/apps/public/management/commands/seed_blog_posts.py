import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.public.models import BlogPost
from apps.public import sitemap


POSTS = [
    {
        'title': 'Launching an MVP Fast: A Practical Guide',
        'slug': 'launching-mvp-fast',
        'excerpt': 'A practical checklist to take your MVP from idea to market in weeks, not months.',
        'content': '# Launching an MVP Fast\n\nThis guide walks founders through the essential steps to ship a Minimum Viable Product quickly and effectively. Focus on the core value, minimize scope, and iterate with user feedback.\n\n## Key Steps\n\n- Define the core user problem\n- Build the minimal feature set\n- Validate with real users\n- Iterate rapidly based on feedback\n',
    },
    {
        'title': 'Integrating AI into Your Product: What to Know',
        'slug': 'integrating-ai-into-your-product',
        'excerpt': 'Practical considerations for adding LLMs and RAG to your web product.',
        'content': '# Integrating AI into Your Product\n\nThis post covers pragmatic patterns for integrating LLMs, vector search, and RAG architectures into existing apps. We discuss cost, latency, security, and dataset preparation.\n\n## Recommendations\n\n- Start with a clear use case\n- Use vectors for retrieval\n- Monitor cost and latency\n',
    },
    {
        'title': 'Choosing Between a Business Website and a SaaS Platform',
        'slug': 'business-website-vs-saas',
        'excerpt': 'How to decide whether you need a marketing site or a full SaaS product.',
        'content': '# Business Website vs SaaS\n\nNot every idea needs a SaaS product. This article helps you choose the right product path based on market, revenue model, and growth goals.\n\n## Considerations\n\n- Revenue model\n- Customer acquisition cost\n- Support and operations overhead\n',
    },
]


class Command(BaseCommand):
    help = 'Create three initial published blog posts (idempotent) and regenerate sitemap.'

    def handle(self, *args, **options):
        created = 0
        for p in POSTS:
            slug = slugify(p['slug'])
            obj, was_created = BlogPost.objects.get_or_create(
                slug=slug,
                defaults={
                    'title': p['title'],
                    'excerpt': p['excerpt'],
                    'content': p['content'],
                    'is_published': True,
                },
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"Created blog post: {obj.slug}"))
            else:
                # ensure published
                if not obj.is_published:
                    obj.is_published = True
                    obj.save(update_fields=['is_published'])
                    self.stdout.write(self.style.SUCCESS(f"Published existing post: {obj.slug}"))

        if created == 0:
            self.stdout.write('No new posts created (already present).')

        # regenerate sitemap and write to frontend/public/sitemap.xml
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
