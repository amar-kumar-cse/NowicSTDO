"""
apps/users/admin.py

Django admin configuration for the users app.
Role is easily editable from the list display.
"""
from django.contrib import admin
from apps.users.models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'clerk_user_id', 'role', 'is_active', 'created_at']
    list_editable = ['role']
    list_filter = ['role', 'is_active']
    search_fields = ['full_name', 'email', 'clerk_user_id']
    readonly_fields = ['clerk_user_id', 'created_at']
    ordering = ['-created_at']
