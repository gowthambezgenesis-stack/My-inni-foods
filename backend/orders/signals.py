import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from payment.models import Payment

from .models import Order

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=Order)
def cache_order_payment_status(sender, instance: Order, **kwargs) -> None:
    """Store previous payment_status so post_save can detect transitions."""
    if not instance.pk:
        instance._previous_payment_status = None
        return

    instance._previous_payment_status = (
        Order.objects.filter(pk=instance.pk)
        .values_list('payment_status', flat=True)
        .first()
    )


@receiver(post_save, sender=Order)
def notify_admins_on_new_paid_order(sender, instance: Order, **kwargs) -> None:
    """
    Email super_admin and order_manager when an order is newly marked as paid.
    Runs asynchronously so payment/order updates are never blocked by SMTP.
    """
    if instance.payment_status != Order.PaymentStatus.PAID:
        return

    previous_status = getattr(instance, '_previous_payment_status', None)
    if previous_status == Order.PaymentStatus.PAID:
        return

    try:
        from notifications.tasks import enqueue_new_order_email

        enqueue_new_order_email(instance.pk)
        logger.info(
            'Queued new order notification for %s',
            instance.order_number,
        )
    except Exception:
        logger.exception(
            'Failed to queue new order notification for %s',
            instance.order_number,
        )


@receiver(post_save, sender=Payment)
def sync_order_on_payment_update(sender, instance: Payment, **kwargs) -> None:
    """
    Keep Order.payment_status in sync when Payment is verified or webhook fires.
    """
    if not instance.razorpay_order_id:
        return

    try:
        order = Order.objects.get(razorpay_order_id=instance.razorpay_order_id)
    except Order.DoesNotExist:
        logger.debug(
            'No order found for Razorpay order %s',
            instance.razorpay_order_id,
        )
        return

    if instance.status == Payment.Status.SUCCESS:
        order.payment_status = Order.PaymentStatus.PAID
        order.razorpay_payment_id = instance.razorpay_payment_id
        if order.status == Order.Status.PENDING:
            order.status = Order.Status.PROCESSING
        order.save(update_fields=[
            'payment_status',
            'razorpay_payment_id',
            'status',
            'updated_at',
        ])
        logger.info('Order %s marked as paid via payment signal', order.order_number)

    elif instance.status == Payment.Status.FAILED:
        order.payment_status = Order.PaymentStatus.FAILED
        order.save(update_fields=['payment_status', 'updated_at'])
        logger.info('Order %s marked as payment failed', order.order_number)
