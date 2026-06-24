import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.db.models import Q
from django.template.loader import render_to_string

from accounts.models import CustomUser
from orders.models import Order
from orders.serializers import resolve_order_customer_name
from orders.utils import get_order_contact_email

logger = logging.getLogger(__name__)

User = get_user_model()

NOTIFY_ROLES = {
    CustomUser.Role.SUPER_ADMIN,
    CustomUser.Role.ORDER_MANAGER,
}


def get_new_order_notification_recipients() -> list[str]:
    """Return active super_admin and order_manager emails."""
    return list(
        User.objects.filter(
            role__in=NOTIFY_ROLES,
            is_active=True,
        )
        .filter(Q(is_profile_active=True) | Q(is_profile_active__isnull=True))
        .exclude(email='')
        .values_list('email', flat=True)
        .distinct(),
    )


def build_admin_order_url(order: Order) -> str:
    base_url = settings.FRONTEND_BASE_URL.rstrip('/')
    return f'{base_url}/admin/orders/{order.pk}'


def send_new_order_email(order: Order) -> bool:
    """
    Email super_admin and order_manager users about a newly paid order.
    Returns True when at least one message was sent successfully.
    """
    if not getattr(settings, 'ORDER_NOTIFICATIONS_ENABLED', True):
        logger.info('Order notifications disabled; skipping email for %s', order.order_number)
        return False

    if not settings.EMAIL_CONFIGURED:
        logger.warning(
            'SMTP not configured; cannot send new order email for %s',
            order.order_number,
        )
        return False

    recipients = get_new_order_notification_recipients()
    if not recipients:
        logger.warning(
            'No super_admin/order_manager recipients found for order %s',
            order.order_number,
        )
        return False

    # Ensure line items are available for the template.
    if not hasattr(order, '_prefetched_objects_cache') or 'items' not in getattr(
        order, '_prefetched_objects_cache', {},
    ):
        order = Order.objects.prefetch_related('items').select_related('user').get(pk=order.pk)

    customer_name = resolve_order_customer_name(order)
    customer_email = get_order_contact_email(order) or '—'
    items_count = order.items.count()

    context = {
        'order': order,
        'order_number': order.order_number,
        'customer_name': customer_name,
        'customer_email': customer_email,
        'total_amount': order.total_amount,
        'items_count': items_count,
        'order_date': order.created_at,
        'admin_order_url': build_admin_order_url(order),
        'site_name': 'inni Products',
    }

    subject = (
        f'{settings.EMAIL_SUBJECT_PREFIX}New order received — {order.order_number}'
    )
    text_body = render_to_string('notifications/emails/new_order.txt', context)
    html_body = render_to_string('notifications/emails/new_order.html', context)

    try:
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
        )
        message.attach_alternative(html_body, 'text/html')
        message.send(fail_silently=False)
        logger.info(
            'New order email sent for %s to %d recipient(s)',
            order.order_number,
            len(recipients),
        )
        return True
    except Exception:
        logger.exception(
            'Failed to send new order email for %s',
            order.order_number,
        )
        return False
