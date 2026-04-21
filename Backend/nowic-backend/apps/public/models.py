"""
apps/public/models.py

Public-facing content models:
  - ServiceOffering  — agency services
  - PortfolioProject — case studies / past work
  - ContactSubmission — inbound contact form entries
"""
from django.db import models


class ServiceOffering(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    tagline = models.CharField(max_length=300)
    description = models.TextField()
    features = models.JSONField(default=list)
    icon_name = models.CharField(max_length=50)
    price_starting = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    delivery_days = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Service Offering'
        verbose_name_plural = 'Service Offerings'

    def __str__(self):
        return self.name


class PortfolioProject(models.Model):
    CATEGORY_CHOICES = [
        ('ai', 'AI'),
        ('saas', 'SaaS'),
        ('ecommerce', 'E-Commerce'),
        ('web', 'Web'),
        ('mobile', 'Mobile'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    tech_stack = models.JSONField(default=list)
    image = models.ImageField(upload_to='portfolio/', blank=True, null=True)
    live_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Portfolio Project'
        verbose_name_plural = 'Portfolio Projects'
        indexes = [
            models.Index(fields=['is_featured', 'order']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.title
        
    @property
    def image_url(self):
        return self.image.url if self.image else ''


class SiteContent(models.Model):
    section = models.SlugField(max_length=100, unique=True)
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['section']
        verbose_name = 'Site Content'
        verbose_name_plural = 'Site Content'

    def __str__(self):
        return self.section


class ContactSubmission(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    BUDGET_CHOICES = [
        ('under_50k', 'Under ₹50K'),
        ('50k_2lac', '₹50K–2L'),
        ('2lac_5lac', '₹2L–5L'),
        ('above_5lac', 'Above ₹5L'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField()
    service_interest = models.ForeignKey(
        'public.ServiceOffering',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contact_submissions',
    )
    project_type = models.CharField(max_length=100, blank=True)
    message = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    budget = models.CharField(max_length=20, choices=BUDGET_CHOICES, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    replied_at = models.DateTimeField(null=True, blank=True)
    reply_note = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Contact Submission'
        verbose_name_plural = 'Contact Submissions'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['submitted_at']),
        ]

    def __str__(self):
        return f"{self.name} — {self.status}"


# Migration needed: makemigrations public
