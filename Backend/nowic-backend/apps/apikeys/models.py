from django.db import models


class APIKey(models.Model):
    name = models.CharField(max_length=200)
    key_hash = models.CharField(max_length=64, unique=True)
    key_prefix = models.CharField(max_length=8)
    owner_clerk_id = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner_clerk_id']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.key_prefix}...)"
