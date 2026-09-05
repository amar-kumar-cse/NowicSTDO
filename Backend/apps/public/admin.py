"""
apps/public/admin.py

Django admin configuration for the public app.
"""
from django.contrib import admin
from apps.public.models import (
    ServiceOffering,
    PortfolioProject,
    ContactSubmission,
    BlogPost,
    SiteContent,
    CustomerReview,
)


@admin.register(ServiceOffering)
class ServiceOfferingAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'price_starting', 'delivery_days', 'is_active', 'order']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order']


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'category', 'is_featured', 'order', 'created_at']
    list_filter = ['category', 'is_featured']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['order']


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'get_project_type_display_label', 'status', 'priority', 'submitted_at']
    
    def get_project_type_display_label(self, obj):
        return obj.get_project_type_display()
    get_project_type_display_label.short_description = 'Project Type'
    list_filter = ['status']
    search_fields = ['name', 'email', 'project_type']
    readonly_fields = ['submitted_at', 'ip_address']
    ordering = ['-submitted_at']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_published', 'read_time_minutes', 'created_at']
    list_filter = ['is_published']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ['section', 'updated_at']
    search_fields = ['section']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CustomerReview)
class CustomerReviewAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'company', 'rating', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'rating']
    search_fields = ['client_name', 'company']
    readonly_fields = ['created_at']
