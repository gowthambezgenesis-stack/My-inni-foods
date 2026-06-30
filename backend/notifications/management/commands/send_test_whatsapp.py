from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from notifications.whatsapp_utils import send_whatsapp_order_confirmation
from orders.invoice_tokens import build_signed_invoice_url, build_track_order_url
from orders.models import Order
from orders.serializers import resolve_order_customer_name
from orders.utils import get_order_contact_phone

User = get_user_model()


class Command(BaseCommand):
    help = 'Send a test WhatsApp order confirmation (optionally for a real paid order).'

    def add_arguments(self, parser):
        parser.add_argument('--phone', required=True, help='10-digit mobile (must be in Twilio sandbox)')
        parser.add_argument('--order-number', help='Existing paid order number (default: IN-TEST123)')
        parser.add_argument('--name', default='Customer', help='Customer name')

    def handle(self, *args, **options):
        phone = options['phone'].strip()
        order_number = (options['order_number'] or 'IN-TEST123').strip().upper()
        name = options['name'].strip()

        order = Order.objects.filter(
            order_number__iexact=order_number,
            payment_status=Order.PaymentStatus.PAID,
        ).first()

        if order:
            name = resolve_order_customer_name(order)
            phone = get_order_contact_phone(order) or phone
            track_url = build_track_order_url(order, phone=phone)
            invoice_url = build_signed_invoice_url(order)
        else:
            track_url = f'http://localhost:3000/track-order?order={order_number}&mobile={phone}'
            invoice_url = None
            self.stdout.write(self.style.WARNING(
                f'Order {order_number} not found or not paid; sending test message without PDF.'
            ))

        ok = send_whatsapp_order_confirmation(
            to_number=phone,
            order_number=order_number,
            customer_name=name,
            track_url=track_url,
            invoice_pdf_url=invoice_url,
        )
        if ok:
            self.stdout.write(self.style.SUCCESS(f'WhatsApp sent to {phone}'))
        else:
            self.stdout.write(self.style.ERROR('WhatsApp failed — check logs and .env settings'))
