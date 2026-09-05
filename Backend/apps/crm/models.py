"""
apps/crm/models.py

CRM models:
  - Lead    — potential clients / inbound enquiries
  - Project — active client projects and revenue tracking
"""
from django.db import models


class Lead(models.Model):
    SOURCE_CHOICES = [
        ('referral', 'Referral'),
        ('cold', 'Cold'),
        ('inbound', 'Inbound'),
    ]
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('reply', 'Reply'),
        ('follow_up', 'Follow Up'),
        ('closed', 'Closed'),
        ('won', 'Won'),
    ]

    company_name = models.CharField(max_length=200)
    founder_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lead'
        verbose_name_plural = 'Leads'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['source']),
            models.Index(fields=['is_active', 'created_at']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.company_name} — {self.status}"


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('delivered', 'Delivered'),
    ]

    name = models.CharField(max_length=200)
    deadline = models.DateField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    progress = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return self.name
