"""
apps/booking/admin.py

Django admin configuration for the booking app.
"""
from django.contrib import admin
from apps.booking.models import BookingService, Appointment


@admin.register(BookingService)
class BookingServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'price', 'duration_minutes', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['clerk_user_id', 'service', 'date', 'time_slot', 'status', 'booked_at']
    list_filter = ['status', 'service']
    search_fields = ['clerk_user_id']
    readonly_fields = ['booked_at']
    ordering = ['-booked_at']
