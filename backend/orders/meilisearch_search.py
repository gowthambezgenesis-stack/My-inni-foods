"""Meilisearch indexing and typo-tolerant order search for admin."""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from django.db.models import QuerySet

from accounts.utils import user_is_admin_staff

from .filters import filter_order_list_queryset
from .models import Order
from .serializers import resolve_order_customer_name
from .utils import format_shipping_phone

logger = logging.getLogger(__name__)

ORDERS_INDEX_UID = 'orders'
SEARCHABLE_ATTRIBUTES = [
    'order_number',
    'customer_name',
    'customer_email',
    'customer_phone',
    'city',
    'state',
    'product_names',
]
FILTERABLE_ATTRIBUTES = ['status', 'payment_status']
SORTABLE_ATTRIBUTES = ['created_at_timestamp', 'total_amount']


def meilisearch_enabled() -> bool:
    return bool(getattr(settings, 'MEILISEARCH_URL', ''))


def get_meilisearch_client():
    if not meilisearch_enabled():
        return None
    try:
        import meilisearch
    except ImportError:
        logger.warning('meilisearch package is not installed')
        return None

    api_key = getattr(settings, 'MEILISEARCH_API_KEY', '') or None
    return meilisearch.Client(settings.MEILISEARCH_URL, api_key)


def order_to_document(order: Order) -> dict[str, Any]:
    address = order.shipping_address or {}
    product_names = ' '.join(
        item.product_name for item in order.items.all() if item.product_name
    )
    customer_email = ''
    customer_phone = format_shipping_phone(address) if address.get('phone') else ''
    if order.user:
        customer_email = order.user.email or ''
        if not customer_phone and order.user.phone:
            customer_phone = format_shipping_phone(
                {'phone': order.user.phone, 'phoneCountryCode': '+91'},
            )

    return {
        'id': str(order.pk),
        'order_number': order.order_number,
        'customer_name': resolve_order_customer_name(order),
        'customer_email': customer_email,
        'customer_phone': customer_phone,
        'city': address.get('city', '') or '',
        'state': address.get('state', '') or '',
        'product_names': product_names,
        'total_amount': float(order.total_amount),
        'status': order.status,
        'payment_status': order.payment_status,
        'created_at_timestamp': int(order.created_at.timestamp()) if order.created_at else 0,
    }


def ensure_orders_index():
    client = get_meilisearch_client()
    if client is None:
        return None

    index = client.index(ORDERS_INDEX_UID)
    try:
        index.update_searchable_attributes(SEARCHABLE_ATTRIBUTES)
        index.update_filterable_attributes(FILTERABLE_ATTRIBUTES)
        index.update_sortable_attributes(SORTABLE_ATTRIBUTES)
        index.update_typo_tolerance(
            {
                'enabled': True,
                'minWordSizeForTypos': {
                    'oneTypo': 4,
                    'twoTypos': 8,
                },
            }
        )
    except Exception:
        logger.exception('Failed to configure Meilisearch orders index')
    return index


def index_order(order: Order) -> None:
    index = ensure_orders_index()
    if index is None:
        return

    try:
        order = Order.objects.select_related('user').prefetch_related('items').get(pk=order.pk)
        index.add_documents([order_to_document(order)])
    except Exception:
        logger.exception('Failed to index order %s in Meilisearch', order.pk)


def remove_order_from_index(order_id: int | str) -> None:
    client = get_meilisearch_client()
    if client is None:
        return

    try:
        client.index(ORDERS_INDEX_UID).delete_document(str(order_id))
    except Exception:
        logger.exception('Failed to remove order %s from Meilisearch', order_id)


def sync_all_orders(batch_size: int = 200) -> int:
    index = ensure_orders_index()
    if index is None:
        return 0

    total = 0
    queryset = Order.objects.select_related('user').prefetch_related('items').order_by('id')
    batch: list[dict[str, Any]] = []

    for order in queryset.iterator(chunk_size=batch_size):
        batch.append(order_to_document(order))
        if len(batch) >= batch_size:
            index.add_documents(batch)
            total += len(batch)
            batch = []

    if batch:
        index.add_documents(batch)
        total += len(batch)

    return total


def _format_suggestion(hit: dict[str, Any], source: str) -> dict[str, Any]:
    formatted = hit.get('_formatted') or {}
    return {
        'id': hit.get('id'),
        'order_number': hit.get('order_number', ''),
        'customer_name': hit.get('customer_name', ''),
        'city': hit.get('city', ''),
        'total_amount': hit.get('total_amount'),
        'status': hit.get('status', ''),
        'highlight_order_number': formatted.get('order_number'),
        'highlight_customer_name': formatted.get('customer_name'),
        'highlight_city': formatted.get('city'),
        'source': source,
    }


def search_orders_meilisearch(query: str, limit: int = 8) -> list[dict[str, Any]] | None:
    index = ensure_orders_index()
    if index is None:
        return None

    try:
        response = index.search(
            query,
            {
                'limit': limit,
                'attributesToHighlight': ['order_number', 'customer_name', 'city', 'product_names'],
                'highlightPreTag': '<mark>',
                'highlightPostTag': '</mark>',
            },
        )
        hits = response.get('hits', [])
        return [_format_suggestion(hit, 'meilisearch') for hit in hits]
    except Exception:
        logger.exception('Meilisearch search failed for query=%r', query)
        return None


def search_orders_database(user, query: str, limit: int = 8) -> list[dict[str, Any]]:
    if not user_is_admin_staff(user):
        return []

    qs = filter_order_list_queryset(user, {'search': query})[:limit]
    results: list[dict[str, Any]] = []
    for order in qs:
        doc = order_to_document(order)
        results.append(_format_suggestion(doc, 'database'))
    return results


def search_order_suggestions(user, query: str, limit: int = 8) -> dict[str, Any]:
    cleaned = query.strip()
    if len(cleaned) < 2:
        return {'results': [], 'source': 'none'}

    meili_results = search_orders_meilisearch(cleaned, limit=limit)
    if meili_results is not None:
        return {'results': meili_results, 'source': 'meilisearch'}

    return {
        'results': search_orders_database(user, cleaned, limit=limit),
        'source': 'database',
    }
