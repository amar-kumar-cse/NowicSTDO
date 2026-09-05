"""
core/urls.py

Root URL configuration for Nowic Studio backend.
"""
from django.contrib import admin
from django.urls import path
from django.http import HttpResponse
from core.api import api
from django.conf import settings
from django.conf.urls.static import static
from apps.public.sitemap import SitemapView, RobotsTxtView

def root_health_check(request):
    return HttpResponse("OK", content_type="text/plain")

urlpatterns = [
    path("", root_health_check),
    path("sitemap.xml", SitemapView.as_view(), name="sitemap"),
    path("robots.txt", RobotsTxtView.as_view(), name="robots"),
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

