from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.public.models import PortfolioProject, ServiceOffering
from shared.cache import bump_cache_namespace


@receiver(post_save, sender=ServiceOffering)
@receiver(post_delete, sender=ServiceOffering)
def invalidate_services_cache(**kwargs):
    bump_cache_namespace("services")
    bump_cache_namespace("stats")


@receiver(post_save, sender=PortfolioProject)
@receiver(post_delete, sender=PortfolioProject)
def invalidate_portfolio_cache(**kwargs):
    bump_cache_namespace("portfolio")
