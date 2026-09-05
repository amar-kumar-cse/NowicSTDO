import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.public.models import BlogPost
from apps.public import sitemap

POSTS = [
    {
        'title': 'Technical SEO for React SPAs: Practical Steps',
        'slug': 'technical-seo-for-react-spas',
        'excerpt': 'How to make React single-page apps crawlable and search-friendly without rebuilding as SSR.',
        'content': '# Technical SEO for React SPAs\n\nSingle-page apps can rank well if you follow key practices: server-render critical meta tags, provide an indexable sitemap, expose llms.txt for AI crawlers, and ensure your pages provide unique content and structured data.\n\n## Checklist\n\n- Ensure meta tags are rendered (Helmet on first paint)\n- Provide a dynamic sitemap.xml\n- Use schema.org structured data\n- Optimize load performance and Core Web Vitals\n',
    },
    {
        'title': 'Building Reliable RAG Pipelines',
        'slug': 'building-reliable-rag-pipelines',
        'excerpt': 'Patterns and pitfalls when building retrieval-augmented generation systems for production.',
        'content': '# Building Reliable RAG Pipelines\n\nRAG systems require careful dataset curation, embedding freshness, and prompt engineering. Maintain tooling for reindexing, monitor vector search recall, and set cost/latency budgets.\n\n## Operational Tips\n\n- Automate reindexing on content change\n- Version your embeddings\n- Monitor perplexity/QA metrics\n',
    },
    {
        'title': 'Designing Admin Dashboards for Non-Technical Users',
        'slug': 'designing-admin-dashboards-for-non-technical-users',
        'excerpt': 'Converting complex data into actionable interfaces for business users.',
        'content': '# Designing Admin Dashboards for Non-Technical Users\n\nGood dashboards hide complexity, surface the right metrics, and provide clear actions. Prioritize clarity, reduce noise, and make exports and filters discoverable.\n\n## Principles\n\n- Start with key questions the user needs to answer\n- Use progressive disclosure for advanced controls\n- Make data exportable and auditable\n',
    },
    {
        'title': 'When to Choose PostgreSQL + pgvector',
        'slug': 'when-to-choose-postgresql-pgvector',
        'excerpt': 'Choosing between specialized vector databases and PostgreSQL with pgvector for vector search.',
        'content': '# When to Choose PostgreSQL + pgvector\n\nFor many applications, PostgreSQL with pgvector provides simplicity, transactional guarantees, and lower ops surface. Choose it when your scale is moderate and you want fewer moving parts.\n\n## Tradeoffs\n\n- Pros: single datastore, simpler backups, ACID guarantees\n- Cons: may require tuning for very large vector indexes\n',
    },
    {
        'title': 'From Idea to Launch: A One-Page Product Brief Template',
        'slug': 'one-page-product-brief-template',
        'excerpt': 'A practical one-page product brief template to align teams before development starts.',
        'content': '# One-Page Product Brief Template\n\nUse a one-page brief to align scope: target user, core problem, success metrics, must-have features, launch timeline, and go-to-market plan. Keep it factual and measurable.\n\n## Template Sections\n\n- Target user & problem\n- Core hypothesis\n- Key features (MVP)\n- Success metrics and timeline\n',
    },
]


class Command(BaseCommand):
    help = 'Seed 5 additional published blog posts and regenerate sitemap.'

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
                if not obj.is_published:
                    obj.is_published = True
                    obj.save(update_fields=['is_published'])
                    self.stdout.write(self.style.SUCCESS(f"Published existing post: {obj.slug}"))

        if created == 0:
            self.stdout.write('No new posts created (already present).')

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
