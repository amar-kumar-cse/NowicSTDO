"""
apps/public/sitemap.py

Dynamic XML sitemap generator.
Serves sitemap.xml at /sitemap.xml — auto-includes:
  - Static pages (home, services, portfolio, about, contact, booking, blog)
  - All published BlogPost slugs (dynamic)
  - All active ServiceOffering slugs (dynamic)
"""
from django.http import HttpResponse
from django.utils import timezone
from django.views import View

SITE_URL = "https://www.nowicstdio.tech"


def _url_entry(loc: str, lastmod: str = None, changefreq: str = "monthly", priority: str = "0.7") -> str:
    parts = [f"  <url>"]
    parts.append(f"    <loc>{loc}</loc>")
    if lastmod:
        parts.append(f"    <lastmod>{lastmod}</lastmod>")
    parts.append(f"    <changefreq>{changefreq}</changefreq>")
    parts.append(f"    <priority>{priority}</priority>")
    parts.append(f"  </url>")
    return "\n".join(parts)


def generate_sitemap_xml() -> str:
    """Generate the sitemap XML string (reusable for views and offline generation).

    Returns:
        str: XML content for sitemap.xml
    """
    today = timezone.now().date().isoformat()

    urls = []

    # ── Static pages ─────────────────────────────────────────────────────
    static_pages = [
        ("", "weekly", "1.0"),
        ("/services", "weekly", "0.9"),
        ("/portfolio", "monthly", "0.8"),
        ("/case-studies", "monthly", "0.8"),
        ("/pricing", "monthly", "0.8"),
        ("/about", "monthly", "0.7"),
        ("/contact", "monthly", "0.7"),
        ("/booking", "monthly", "0.7"),
        ("/blog", "daily", "0.9"),
        ("/privacy-policy", "yearly", "0.3"),
    ]
    for path, freq, prio in static_pages:
        urls.append(_url_entry(f"{SITE_URL}{path}", today, freq, prio))

    # ── Dynamic: Published Blog Posts ─────────────────────────────────────
    try:
        from apps.public.models import BlogPost

        posts = BlogPost.objects.filter(is_published=True).values_list("slug", "updated_at")
        for slug, updated_at in posts:
            try:
                lastmod = updated_at.date().isoformat() if updated_at else today
            except Exception:
                lastmod = today
            urls.append(_url_entry(f"{SITE_URL}/blog/{slug}", lastmod=lastmod, changefreq="monthly", priority="0.8"))
    except Exception:
        # Fail silently when running outside the app DB context
        pass

    # ── Dynamic: Portfolio Projects (case studies / portfolio items) ──────
    try:
        from apps.public.models import PortfolioProject

        projects = PortfolioProject.objects.all().values_list("slug", "created_at")
        for slug, created_at in projects:
            try:
                lastmod = created_at.date().isoformat() if created_at else today
            except Exception:
                lastmod = today
            urls.append(_url_entry(f"{SITE_URL}/portfolio/{slug}", lastmod=lastmod, changefreq="monthly", priority="0.7"))
    except Exception:
        pass

    # ── Dynamic: Active Services (individual service pages if they exist) ─
    try:
        from apps.public.models import ServiceOffering

        services = ServiceOffering.objects.filter(is_active=True).values("slug")
        for svc in services:
            # Use proper per-service route instead of anchor links
            urls.append(
                _url_entry(
                    f"{SITE_URL}/services/{svc['slug']}",
                    lastmod=today,
                    changefreq="monthly",
                    priority="0.6",
                )
            )
    except Exception:
        pass

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n"
        + "</urlset>"
    )

    return xml


class SitemapView(View):
    """Render and serve a dynamic sitemap.xml."""

    def get(self, request):
        xml = generate_sitemap_xml()
        return HttpResponse(xml, content_type="application/xml")


class RobotsTxtView(View):
    """Render and serve robots.txt."""

    def get(self, request):
        lines = [
            "User-agent: *",
            "Allow: /",
            "Disallow: /admin/",
            "Disallow: /api/",
            "Disallow: /dashboard/",
            "Disallow: /admin",
            "",
            f"Sitemap: {SITE_URL}/sitemap.xml",
            "",
            "User-agent: Googlebot",
            "Allow: /",
            "",
            "User-agent: Bingbot",
            "Allow: /",
        ]
        return HttpResponse("\n".join(lines), content_type="text/plain")
