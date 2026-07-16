import hashlib
import hmac

from django.conf import settings

from .models import Order


def make_invoice_access_token(order: Order) -> str:
    message = f'{order.pk}:{order.order_number}'
    return hmac.new(
        settings.SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()[:32]


def verify_invoice_access_token(order: Order, token: str) -> bool:
    if not token:
        return False
    expected = make_invoice_access_token(order)
    return hmac.compare_digest(expected, token)


def build_signed_invoice_url(order: Order) -> str | None:
    """
    Public HTTPS URL for Twilio to fetch the invoice PDF as a WhatsApp attachment.
  Requires API_PUBLIC_BASE_URL (e.g. ngrok tunnel in local dev).
    """
    base = getattr(settings, 'API_PUBLIC_BASE_URL', '').strip().rstrip('/')
    if not base:
        return None
    token = make_invoice_access_token(order)
    return f'{base}/api/orders/invoice/{order.order_number}/{token}/'


def build_track_order_url(
    order: Order,
    *,
    phone: str | None = None,
    email: str | None = None,
) -> str:
    from urllib.parse import urlencode

    from config.public_urls import normalize_public_base_url

    base = normalize_public_base_url(settings.FRONTEND_BASE_URL) or 'https://www.innifoods.com'
    params: dict[str, str] = {'order': order.order_number}
    if phone:
        params['mobile'] = phone
    elif email:
        params['email'] = email
    return f'{base}/track-order?{urlencode(params)}'
