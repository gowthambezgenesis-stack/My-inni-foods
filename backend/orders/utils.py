import re
from datetime import timedelta

from payment.models import Payment

from .models import Order

PHONE_DIGIT_PATTERN = re.compile(r'\D+')

STATUS_RANK = {
    Order.Status.PENDING: 0,
    Order.Status.PROCESSING: 1,
    Order.Status.SHIPPING: 2,
    Order.Status.OUT_FOR_DELIVERY: 3,
    Order.Status.DELIVERED: 4,
    Order.Status.CANCELLED: -1,
}


def normalize_phone(value: str) -> str:
    digits = PHONE_DIGIT_PATTERN.sub('', (value or '').strip())
    return digits[-10:] if len(digits) >= 10 else digits


def format_shipping_phone(address: dict | None) -> str:
    if not address:
        return ''

    phone = str(address.get('phone', '') or '').strip()
    if not phone:
        return ''

    country_code = str(address.get('phoneCountryCode', '+91') or '+91').strip()
    if country_code and not country_code.startswith('+'):
        country_code = f'+{country_code}'

    return f'{country_code} {phone}'


def get_order_contact_email(order: Order) -> str | None:
    address = order.shipping_address or {}
    address_email = (address.get('email') or '').strip().lower()
    if address_email:
        return address_email

    payment = (
        Payment.objects.filter(order_id=order.order_number)
        .order_by('-created_at')
        .first()
    )
    if payment and isinstance(payment.notes, dict):
        email = (payment.notes.get('email') or '').strip().lower()
        if email:
            return email

    if order.user_id and order.user.email:
        return order.user.email.strip().lower()

    return None


def get_order_contact_phone(order: Order) -> str | None:
    address = order.shipping_address or {}
    phone = normalize_phone(address.get('phone', ''))
    if len(phone) == 10:
        return phone

    if order.user_id and order.user.phone:
        user_phone = normalize_phone(order.user.phone)
        if len(user_phone) == 10:
            return user_phone

    return None


def order_matches_guest_credentials(order: Order, *, email: str = '', mobile: str = '') -> bool:
    if email:
        order_email = get_order_contact_email(order)
        return bool(order_email and order_email == email.strip().lower())

    if mobile:
        order_phone = get_order_contact_phone(order)
        return bool(order_phone and order_phone == normalize_phone(mobile))

    return False


def _status_rank(order: Order) -> int:
    return STATUS_RANK.get(order.status, 0)


def _status_at_least(order: Order, minimum_status: str) -> bool:
    return _status_rank(order) >= STATUS_RANK.get(minimum_status, 0)


def get_order_display_status(order: Order) -> str:
    labels = {
        Order.Status.PENDING: 'Pending',
        Order.Status.PROCESSING: 'Processing',
        Order.Status.SHIPPING: 'Shipping',
        Order.Status.OUT_FOR_DELIVERY: 'Out for Delivery',
        Order.Status.DELIVERED: 'Delivered',
        Order.Status.CANCELLED: 'Cancelled',
    }
    if order.status in labels:
        return labels[order.status]
    if order.payment_status == Order.PaymentStatus.PAID:
        return 'Confirmed'
    return 'Pending'


def get_order_tracking_info(order: Order) -> dict | None:
    address = order.shipping_address or {}
    carrier = (address.get('carrier') or address.get('trackingCarrier') or '').strip()
    tracking_number = (address.get('trackingNumber') or address.get('tracking_number') or '').strip()

    if carrier or tracking_number:
        return {
            'carrier': carrier or None,
            'tracking_number': tracking_number or None,
        }

    return None


def get_estimated_delivery_date(order: Order) -> str | None:
    if order.status == Order.Status.DELIVERED:
        return order.updated_at.date().isoformat()

    if order.status == Order.Status.CANCELLED:
        return None

    if order.status in {Order.Status.OUT_FOR_DELIVERY, Order.Status.SHIPPING}:
        return (order.updated_at.date() + timedelta(days=2)).isoformat()

    if order.status == Order.Status.PROCESSING:
        return (order.created_at.date() + timedelta(days=5)).isoformat()

    if order.payment_status == Order.PaymentStatus.PAID:
        return (order.created_at.date() + timedelta(days=7)).isoformat()

    return None


def _interpolate_stage_timestamp(order: Order, stage_index: int, completed_indices: list[int]):
    if stage_index == 0:
        return order.created_at

    if stage_index == completed_indices[-1]:
        return order.updated_at

    if len(completed_indices) <= 1:
        return order.created_at

    position = completed_indices.index(stage_index)
    span_seconds = max((order.updated_at - order.created_at).total_seconds(), 0)
    ratio = position / max(len(completed_indices) - 1, 1)
    return order.created_at + timedelta(seconds=max(span_seconds * ratio, position * 3600))


def build_order_tracking_history(order: Order) -> list[dict]:
    address = order.shipping_address or {}
    city = (address.get('city') or '').strip()
    state = (address.get('state') or '').strip()
    destination = ', '.join(part for part in [city, state] if part) or 'your delivery location'
    origin = 'inni Fulfillment Center, Bangalore'

    if order.status == Order.Status.CANCELLED:
        return [
            {
                'title': 'Order Received',
                'timestamp': order.created_at.isoformat(),
                'location': f'At {origin}',
                'completed': True,
                'is_current': False,
            },
            {
                'title': 'Order Cancelled',
                'timestamp': order.updated_at.isoformat(),
                'location': destination,
                'completed': True,
                'is_current': True,
            },
        ]

    stages: list[tuple[str, str, object]] = [
        ('Order Received', f'At {origin}', lambda o: True),
        ('Processing', f'At {origin}', lambda o: _status_at_least(o, Order.Status.PROCESSING)),
        (
            'Shipping',
            f'From {origin} to {destination}',
            lambda o: _status_at_least(o, Order.Status.SHIPPING),
        ),
        (
            'Out For Delivery',
            f'At location {destination}',
            lambda o: _status_at_least(o, Order.Status.OUT_FOR_DELIVERY),
        ),
        (
            'Delivered',
            f'At location {destination}',
            lambda o: _status_at_least(o, Order.Status.DELIVERED),
        ),
    ]

    completed_indices = [index for index, (_, _, check) in enumerate(stages) if check(order)]
    if not completed_indices:
        completed_indices = [0]

    current_index = completed_indices[-1]

    history: list[dict] = []
    for index, (title, location, check) in enumerate(stages):
        is_completed = check(order)
        history.append(
            {
                'title': title,
                'timestamp': (
                    _interpolate_stage_timestamp(order, index, completed_indices).isoformat()
                    if is_completed
                    else None
                ),
                'location': location,
                'completed': is_completed,
                'is_current': index == current_index and is_completed,
            }
        )

    return history
