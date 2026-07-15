import logging
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.db.models import Q
from django.template.loader import render_to_string

from accounts.models import CustomUser
from orders.invoice_tokens import build_track_order_url
from orders.models import Order
from orders.serializers import resolve_order_customer_name
from orders.utils import format_shipping_phone, get_order_contact_email

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
    is_cod = order.payment_method == Order.PaymentMethod.COD

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
        'is_cod': is_cod,
        'payment_method_label': order.get_payment_method_display(),
        'payment_status_label': order.get_payment_status_display(),
        'headline': (
            'New Cash on Delivery order received'
            if is_cod
            else 'New paid order received'
        ),
        'intro': (
            'A customer placed a Cash on Delivery order. Review the details below.'
            if is_cod
            else 'A customer has completed payment. Review the order details below.'
        ),
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


def _load_order_with_items(order: Order) -> Order:
    if not hasattr(order, '_prefetched_objects_cache') or 'items' not in getattr(
        order, '_prefetched_objects_cache', {},
    ):
        return Order.objects.prefetch_related('items').select_related('user').get(pk=order.pk)
    return order


def _format_shipping_lines(order: Order) -> list[str]:
    address = order.shipping_address or {}
    lines: list[str] = []

    name = f"{address.get('firstName', '')} {address.get('lastName', '')}".strip()
    if name:
        lines.append(name)

    street = str(address.get('address') or '').strip()
    if street:
        lines.append(street)

    city_line = ', '.join(
        part for part in [
            str(address.get('city') or '').strip(),
            str(address.get('state') or '').strip(),
            str(address.get('zip') or '').strip(),
        ] if part
    )
    if city_line:
        lines.append(city_line)

    phone = format_shipping_phone(address)
    if phone:
        lines.append(phone)

    return lines


def _customer_confirmation_message(order: Order) -> str:
    if order.payment_method == Order.PaymentMethod.COD:
        return (
            'We have received your Cash on Delivery order. '
            'Our team will prepare your spices and ship them soon.'
        )
    return (
        'We have received your payment and confirmed your order. '
        'Our team will prepare your spices and ship them soon.'
    )


def _customer_payment_label(order: Order) -> str:
    method = order.get_payment_method_display()
    status = order.get_payment_status_display()
    return f'{method} · {status}'


def send_customer_order_success_email(order: Order) -> bool:
    """
    Email the customer after a successful checkout with order number and details.
    Returns True when the message was sent successfully.
    """
    if not getattr(settings, 'ORDER_NOTIFICATIONS_ENABLED', True):
        logger.info(
            'Order notifications disabled; skipping customer email for %s',
            order.order_number,
        )
        return False

    if not settings.EMAIL_CONFIGURED:
        logger.warning(
            'SMTP not configured; cannot send customer order email for %s',
            order.order_number,
        )
        return False

    order = _load_order_with_items(order)
    customer_email = get_order_contact_email(order)
    if not customer_email:
        logger.info(
            'No customer email on order %s; skipping customer confirmation',
            order.order_number,
        )
        return False

    customer_name = resolve_order_customer_name(order)
    items = []
    items_subtotal = Decimal('0.00')
    for item in order.items.all():
        line_total = (item.price_at_time * item.quantity).quantize(Decimal('0.01'))
        items_subtotal += line_total
        items.append(
            {
                'product_name': item.product_name,
                'weight': item.weight,
                'quantity': item.quantity,
                'line_total': line_total,
            }
        )

    shipping_amount = (Decimal(order.total_amount) - items_subtotal).quantize(Decimal('0.01'))
    if shipping_amount < 0:
        shipping_amount = Decimal('0.00')
    shipping_display = 'Free' if shipping_amount <= 0 else f'₹{shipping_amount}'

    context = {
        'order': order,
        'order_number': order.order_number,
        'customer_name': customer_name,
        'customer_email': customer_email,
        'total_amount': order.total_amount,
        'order_date': order.created_at,
        'items': items,
        'shipping_amount': shipping_amount,
        'shipping_display': shipping_display,
        'shipping_is_free': shipping_amount <= 0,
        'shipping_lines': _format_shipping_lines(order),
        'payment_label': _customer_payment_label(order),
        'status_label': order.get_status_display(),
        'confirmation_message': _customer_confirmation_message(order),
        'track_url': build_track_order_url(order, email=customer_email),
        'site_name': 'inni Products',
    }

    subject = (
        f'{settings.EMAIL_SUBJECT_PREFIX}Order confirmed — {order.order_number}'
    )
    text_body = render_to_string(
        'notifications/emails/customer_order_success.txt',
        context,
    )
    html_body = render_to_string(
        'notifications/emails/customer_order_success.html',
        context,
    )

    try:
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[customer_email],
        )
        message.attach_alternative(html_body, 'text/html')
        message.send(fail_silently=False)
        logger.info(
            'Customer order success email sent for %s to %s',
            order.order_number,
            customer_email,
        )
        return True
    except Exception:
        logger.exception(
            'Failed to send customer order success email for %s',
            order.order_number,
        )
        return False
