"""
apps/crm/admin.py

Django admin configuration for the CRM app.
"""
from django.contrib import admin
from apps.crm.models import Lead, Project


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'founder_name', 'email', 'source', 'status', 'is_active', 'created_at']
    list_filter = ['status', 'source', 'is_active']
    search_fields = ['company_name', 'founder_name', 'email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'progress', 'cost', 'deadline', 'created_at']
    list_filter = ['status']
    search_fields = ['name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
