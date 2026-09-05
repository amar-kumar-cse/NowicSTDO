from django.db import models


class DailySnapshot(models.Model):
    date = models.DateField(unique=True)
    new_leads = models.IntegerField(default=0)
    leads_won = models.IntegerField(default=0)
    new_bookings = models.IntegerField(default=0)
    new_contacts = models.IntegerField(default=0)
    revenue_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        indexes = [models.Index(fields=['date'])]

    def __str__(self):
        return f"Snapshot {self.date}"
