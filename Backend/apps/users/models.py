"""
apps/users/models.py

UserProfile — mirrors Clerk users in the local database.
Synced via Clerk webhooks.
"""
from django.db import models


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('client', 'Client'),
    ]

    clerk_user_id = models.CharField(max_length=200, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        indexes = [
            models.Index(fields=['clerk_user_id']),
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.role})"
