import uuid

from django.conf import settings
from django.db import models


class Order(models.Model):
    """Customer order with Razorpay payment linkage."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        SHIPPING = 'shipping', 'Shipping'
        OUT_FOR_DELIVERY = 'out_for_delivery', 'Out for Delivery'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    shipping_address = models.JSONField(default=dict, blank=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, default='')
    razorpay_payment_id = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.order_number} ({self.status})'

    @classmethod
    def generate_order_number(cls) -> str:
        return f'IN-{uuid.uuid4().hex[:8].upper()}'


class OrderItem(models.Model):
    """Line item within an order — product details snapshotted from checkout."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product_id = models.CharField(max_length=100)
    product_name = models.CharField(max_length=200)
    product_image = models.URLField(blank=True, default='')
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)
    weight = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        ordering = ['id']

    def __str__(self) -> str:
        return f'{self.product_name} x{self.quantity}'
