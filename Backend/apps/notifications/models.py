from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ('new_lead', 'New Lead'),
        ('new_booking', 'New Booking'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('new_contact', 'New Contact'),
        ('lead_won', 'Lead Won'),
        ('follow_up_reminder', 'Follow Up Reminder'),
        ('project_update', 'Project Update'),
        ('project_file', 'Project File Shared'),
        ('invoice_created', 'Invoice Created'),
        ('invoice_updated', 'Invoice Updated'),
    ]

    recipient_clerk_id = models.CharField(max_length=200)
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient_clerk_id', 'is_read']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.notification_type} -> {self.recipient_clerk_id}"
