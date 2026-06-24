import uuid

from django.conf import settings
from django.db import models


class Payment(models.Model):
    """Stores Razorpay payment records linked to an internal order."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'

    order_id = models.CharField(max_length=100, unique=True, db_index=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, default='')
    razorpay_payment_id = models.CharField(max_length=100, blank=True, default='')
    razorpay_signature = models.CharField(max_length=255, blank=True, default='')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
    )
    # Optional metadata (e.g. shipping info, cart items) stored as JSON
    notes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.order_id} ({self.status})'

    @classmethod
    def generate_order_id(cls) -> str:
        return f'ORD-{uuid.uuid4().hex[:12].upper()}'
