import logging
import threading

from orders.models import Order

from .utils import send_new_order_email

logger = logging.getLogger(__name__)


def _send_new_order_email_safe(order_id: int) -> None:
    """Load order and send email; never raise to caller."""
    try:
        order = Order.objects.prefetch_related('items').select_related('user').get(pk=order_id)
    except Order.DoesNotExist:
        logger.warning('New order email skipped: order id %s not found', order_id)
        return

    send_new_order_email(order)


def enqueue_new_order_email(order_id: int) -> None:
    """
    Send new-order email without blocking the request/payment flow.

    Uses a background thread by default. When Celery is added, this will call
    `send_new_order_email_task.delay(order_id)` automatically.
    """
    try:
        from notifications.tasks import send_new_order_email_task

        send_new_order_email_task.delay(order_id)
        return
    except (ImportError, AttributeError):
        pass
    except Exception:
        logger.exception(
            'Celery dispatch failed for order id %s; using background thread',
            order_id,
        )

    thread = threading.Thread(
        target=_send_new_order_email_safe,
        args=(order_id,),
        daemon=True,
        name=f'new-order-email-{order_id}',
    )
    thread.start()


# Optional Celery task — active only when celery is installed and configured.
try:
    from celery import shared_task

    @shared_task(bind=True, max_retries=3, default_retry_delay=60)
    def send_new_order_email_task(self, order_id: int) -> None:
        try:
            _send_new_order_email_safe(order_id)
        except Exception as exc:
            logger.exception('Celery new order email failed for order id %s', order_id)
            raise self.retry(exc=exc) from exc

except ImportError:
    pass
