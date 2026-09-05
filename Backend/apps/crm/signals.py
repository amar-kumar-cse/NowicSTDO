from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.crm.models import Project
from shared.cache import bump_cache_namespace


@receiver(post_save, sender=Project)
@receiver(post_delete, sender=Project)
def invalidate_stats_cache(**kwargs):
    bump_cache_namespace("stats")
