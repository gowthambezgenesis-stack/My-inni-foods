from django.core.management.base import BaseCommand, CommandError

from notifications.utils import send_new_order_email
from orders.models import Order


class Command(BaseCommand):
    help = 'Send a test new-order notification email for an existing paid order.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--order-number',
            help='Order number (e.g. IN-AB12CD34). Uses latest paid order if omitted.',
        )

    def handle(self, *args, **options):
        order_number = options.get('order_number')

        if order_number:
            try:
                order = (
                    Order.objects.prefetch_related('items')
                    .select_related('user')
                    .get(order_number__iexact=order_number.strip())
                )
            except Order.DoesNotExist as exc:
                raise CommandError(f'Order not found: {order_number}') from exc
        else:
            order = (
                Order.objects.filter(payment_status=Order.PaymentStatus.PAID)
                .prefetch_related('items')
                .select_related('user')
                .order_by('-created_at')
                .first()
            )
            if not order:
                raise CommandError('No paid orders found. Place a test order first.')

        sent = send_new_order_email(order)
        if sent:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Test new-order email sent for {order.order_number}.',
                ),
            )
        else:
            raise CommandError(
                f'Email was not sent for {order.order_number}. '
                'Check SMTP settings, ORDER_NOTIFICATIONS_ENABLED, and admin recipients.',
            )
