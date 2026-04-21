from django.apps import AppConfig

class PublicConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.public'
    label = 'public'

    def ready(self):
        from apps.public import signals  # noqa: F401
