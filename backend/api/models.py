import uuid
from django.db import models


class Caller(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    assigned_schools = models.JSONField(default=list)
    assigned_courses = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    session_token = models.CharField(max_length=64, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Contact(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'), ('contacted', 'Contacted'), ('interested', 'Interested'),
        ('converted', 'Converted'), ('lost', 'Lost'),
    ]
    INTENT_CHOICES = [
        ('interested', 'Interested'), ('not-interested', 'Not Interested'),
        ('neutral', 'Neutral'), ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, default='')
    course = models.CharField(max_length=255, blank=True, default='')
    school = models.CharField(max_length=255, blank=True, default='')
    source = models.CharField(max_length=255, blank=True, default='Manual Entry')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    tags = models.JSONField(default=list)
    lead_score = models.IntegerField(default=50)
    intent = models.CharField(max_length=20, choices=INTENT_CHOICES, default='neutral', blank=True)
    message_count = models.IntegerField(default=0)
    reply_count = models.IntegerField(default=0)
    has_opted_in = models.BooleanField(default=False)
    opted_in_at = models.DateTimeField(null=True, blank=True)
    notes = models.JSONField(default=list)
    custom_fields = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_contacted_at = models.DateTimeField(null=True, blank=True)
    last_reply_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Campaign(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'), ('scheduled', 'Scheduled'), ('running', 'Running'),
        ('paused', 'Paused'), ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    message_template = models.TextField(blank=True, default='')
    media_url = models.URLField(blank=True, default='')
    target_tags = models.JSONField(default=list)
    target_segments = models.JSONField(default=list)
    target_contact_ids = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    total_recipients = models.IntegerField(default=0)
    sent_count = models.IntegerField(default=0)
    delivered_count = models.IntegerField(default=0)
    read_count = models.IntegerField(default=0)
    replied_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    ab_test_enabled = models.BooleanField(default=False)
    variant_a = models.TextField(blank=True, default='')
    variant_b = models.TextField(blank=True, default='')
    created_by = models.CharField(max_length=255, default='Admin')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Automation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=False)
    trigger = models.JSONField(default=dict)
    actions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('in-progress', 'In Progress'),
        ('completed', 'Completed'), ('overdue', 'Overdue'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    contact_id = models.CharField(max_length=255, blank=True, default='')
    assigned_to = models.CharField(max_length=255, default='Admin')
    assigned_by = models.CharField(max_length=255, default='Admin')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    reminder_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Message(models.Model):
    DIRECTION_CHOICES = [('inbound', 'Inbound'), ('outbound', 'Outbound')]
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('sent', 'Sent'), ('delivered', 'Delivered'),
        ('read', 'Read'), ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact_id = models.CharField(max_length=255, db_index=True)
    content = models.TextField()
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, default='')
    media_url = models.URLField(blank=True, default='')
    media_type = models.CharField(max_length=20, blank=True, default='')
    campaign_id = models.CharField(max_length=255, blank=True, default='')
    is_automated = models.BooleanField(default=False)

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"{self.direction} - {self.contact_id}"
