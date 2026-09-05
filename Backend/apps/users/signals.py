from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.users.models import UserProfile
from shared.cache import bump_cache_namespace


@receiver(post_save, sender=UserProfile)
@receiver(post_delete, sender=UserProfile)
def invalidate_stats_cache(**kwargs):
    bump_cache_namespace("stats")
