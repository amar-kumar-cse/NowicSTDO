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
        ('mvp', 'MVP Development'),
        ('website', 'Business Website'),
        ('ai_app', 'AI Web App'),
        ('dashboard', 'Admin Dashboard'),
        ('saas', 'SaaS Platform'),
        ('api', 'API & Backend'),
        ('mobile', 'Mobile App'),
        ('ecommerce', 'E-Commerce'),
        ('other', 'Other'),
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

    PROJECT_TYPE_CHOICES = [
        ('mvp_development', 'MVP Development'),
        ('business_website', 'Business Website'),
        ('ai_web_app', 'AI Web App'),
        ('admin_dashboard', 'Admin Dashboard'),
        ('saas_platform', 'SaaS Platform'),
        ('api_backend', 'API / Backend'),
        ('other', 'Other'),
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
    project_type = models.CharField(
        max_length=100,
        default='other',
        blank=True
    )
    message = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    budget = models.CharField(max_length=100, choices=BUDGET_CHOICES, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    replied_at = models.DateTimeField(null=True, blank=True)
    reply_note = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True, default=None)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Contact Submission'
        verbose_name_plural = 'Contact Submissions'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['submitted_at']),
            models.Index(fields=['project_type']),
        ]

    def __str__(self):
        return f"{self.name} — {self.status}"

class CustomerReview(models.Model):
    client_name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=255, blank=True, null=True)
    rating = models.IntegerField(default=5)
    review_text = models.TextField()
    is_approved = models.BooleanField(default=False)
    avatar_url = models.URLField(blank=True, null=True, max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Customer Review'
        verbose_name_plural = 'Customer Reviews'
        indexes = [
            models.Index(fields=['is_approved']),
            models.Index(fields=['rating']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Review by {self.client_name} ({self.rating} Stars)"


class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    excerpt = models.TextField(blank=True)
    content = models.TextField()  # Markdown content
    cover_image = models.CharField(max_length=1000, blank=True, default='')
    is_published = models.BooleanField(default=False)
    read_time_minutes = models.IntegerField(default=5)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
        indexes = [
            models.Index(fields=['is_published', 'created_at']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.title

    @property
    def cover_image_url(self):
        if not self.cover_image:
            return ''
        url_str = str(self.cover_image).strip()
        if url_str.startswith('http://') or url_str.startswith('https://'):
            return url_str
        if url_str.startswith('/media/'):
            return url_str
        return f'/media/{url_str.lstrip("/")}'

