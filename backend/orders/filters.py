from datetime import timedelta

from django.db.models import Q, QuerySet
from django.utils import timezone

from accounts.utils import user_is_admin_staff

from .models import Order

RECENT_DELIVERED_DAYS = 1


def parse_bool_query_param(value: str | None) -> bool:
    if value is None:
        return False
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def apply_recent_orders_filter(queryset: QuerySet) -> QuerySet:
    """
    Recent orders = non-cancelled orders that are not delivered,
    or delivered within the last day. Cancelled orders only appear in All Orders.
    """
    cutoff = timezone.now() - timedelta(days=RECENT_DELIVERED_DAYS)
    return queryset.exclude(status=Order.Status.CANCELLED).exclude(
        Q(status=Order.Status.DELIVERED) & Q(updated_at__lt=cutoff),
    )


def apply_all_orders_filter(queryset: QuerySet) -> QuerySet:
    """
    All Orders = orders that are no longer recent:
    cancelled, or delivered more than RECENT_DELIVERED_DAYS ago.
    """
    cutoff = timezone.now() - timedelta(days=RECENT_DELIVERED_DAYS)
    return queryset.filter(
        Q(status=Order.Status.CANCELLED)
        | (Q(status=Order.Status.DELIVERED) & Q(updated_at__lt=cutoff)),
    )


def filter_order_list_queryset(user, query_params) -> QuerySet:
    queryset = Order.objects.select_related('user').prefetch_related('items')

    if user_is_admin_staff(user):
        qs = queryset
    else:
        qs = queryset.filter(user=user)

    status_filter = query_params.get('status')
    payment_status = query_params.get('payment_status')
    search = query_params.get('search')
    recent = parse_bool_query_param(query_params.get('recent'))
    all_orders = parse_bool_query_param(query_params.get('all'))

    if status_filter:
        qs = qs.filter(status=status_filter)
    if payment_status:
        qs = qs.filter(payment_status=payment_status)
    if search:
        search_q = (
            Q(order_number__icontains=search)
            | Q(shipping_address__city__icontains=search)
            | Q(shipping_address__state__icontains=search)
            | Q(user__username__icontains=search)
            | Q(user__full_name__icontains=search)
            | Q(shipping_address__firstName__icontains=search)
            | Q(shipping_address__lastName__icontains=search)
            | Q(shipping_address__phone__icontains=search)
            | Q(user__phone__icontains=search)
        )
        phone_digits = ''.join(ch for ch in search if ch.isdigit())
        if phone_digits:
            search_q |= Q(shipping_address__phone__icontains=phone_digits)
            search_q |= Q(user__phone__icontains=phone_digits)
        qs = qs.filter(search_q)
    if recent:
        qs = apply_recent_orders_filter(qs)
    elif all_orders:
        qs = apply_all_orders_filter(qs)

    return qs
