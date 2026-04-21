from django.db import models


class ProjectClientAssignment(models.Model):
    project = models.ForeignKey('crm.Project', on_delete=models.CASCADE, related_name='client_assignments')
    client = models.ForeignKey('users.UserProfile', on_delete=models.CASCADE, related_name='project_assignments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['project', 'client']
        indexes = [
            models.Index(fields=['project']),
            models.Index(fields=['client']),
        ]

    def __str__(self):
        return f"{self.project_id}:{self.client_id}"


class ProjectUpdate(models.Model):
    project = models.ForeignKey('crm.Project', on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    description = models.TextField()
    progress = models.IntegerField()
    posted_by = models.CharField(max_length=200)
    posted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-posted_at']

    def __str__(self):
        return f"{self.project_id} - {self.title}"


class ProjectFile(models.Model):
    project = models.ForeignKey('crm.Project', on_delete=models.CASCADE, related_name='files')
    file_url = models.URLField()
    file_name = models.CharField(max_length=200)
    file_type = models.CharField(max_length=50)
    uploaded_by = models.CharField(max_length=200)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.project_id} - {self.file_name}"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]

    project = models.ForeignKey('crm.Project', on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    due_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return self.invoice_number

    @property
    def remaining_amount(self):
        return self.amount - self.paid_amount
