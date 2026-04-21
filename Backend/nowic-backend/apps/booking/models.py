"""
apps/booking/models.py

Booking system models:
  - BookingService — services available to book
  - Appointment    — a booked session (unique per date+time slot)
"""
from django.db import models


class BookingService(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField()
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Booking Service'
        verbose_name_plural = 'Booking Services'

    def __str__(self):
        return self.name


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    clerk_user_id = models.CharField(max_length=200)
    service = models.ForeignKey(
        BookingService, on_delete=models.CASCADE, related_name='appointments'
    )
    date = models.DateField()
    time_slot = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cancellation_reason = models.TextField(blank=True)
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-booked_at']
        unique_together = ['date', 'time_slot', 'service']
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'
        indexes = [
            models.Index(fields=['clerk_user_id']),
            models.Index(fields=['date', 'time_slot', 'service']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.clerk_user_id} — {self.date}"
