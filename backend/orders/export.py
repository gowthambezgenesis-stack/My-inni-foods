import csv
import io
from datetime import datetime

from django.utils import timezone

from .models import Order
from .serializers import resolve_order_customer_name
from .utils import format_shipping_phone, get_order_contact_email


def _format_datetime(value: datetime | None) -> str:
    if not value:
        return ''
    if timezone.is_aware(value):
        value = timezone.localtime(value)
    return value.strftime('%Y-%m-%d %H:%M')


def _address_field(order: Order, key: str) -> str:
    address = order.shipping_address or {}
    return str(address.get(key, '') or '').strip()


def build_orders_export_csv(orders: list[Order]) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            'Order Number',
            'Order Date',
            'Customer Name',
            'Email',
            'Phone',
            'City',
            'State',
            'Address',
            'Total (INR)',
            'Payment Status',
            'Fulfillment Status',
            'Items Count',
            'Last Updated',
        ],
    )

    for order in orders:
        writer.writerow(
            [
                order.order_number,
                _format_datetime(order.created_at),
                resolve_order_customer_name(order),
                get_order_contact_email(order) or '',
                format_shipping_phone(order.shipping_address),
                _address_field(order, 'city'),
                _address_field(order, 'state'),
                _address_field(order, 'address'),
                order.total_amount,
                order.payment_status,
                order.status,
                order.items.count(),
                _format_datetime(order.updated_at),
            ],
        )

    return buffer.getvalue().encode('utf-8-sig')


def build_order_detail_export_csv(order: Order) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    writer.writerow(['Order Number', order.order_number])
    writer.writerow(['Order Date', _format_datetime(order.created_at)])
    writer.writerow(['Customer', resolve_order_customer_name(order)])
    writer.writerow(['Email', get_order_contact_email(order) or ''])
    writer.writerow(['Phone', format_shipping_phone(order.shipping_address)])
    writer.writerow(['Payment Status', order.payment_status])
    writer.writerow(['Fulfillment Status', order.status])
    writer.writerow(['Total (INR)', order.total_amount])
    writer.writerow([])

    writer.writerow(['Product', 'Quantity', 'Weight', 'Unit Price (INR)', 'Line Total (INR)'])
    for item in order.items.all():
        line_total = item.price_at_time * item.quantity
        writer.writerow(
            [
                item.product_name,
                item.quantity,
                item.weight,
                item.price_at_time,
                line_total,
            ],
        )

    return buffer.getvalue().encode('utf-8-sig')
