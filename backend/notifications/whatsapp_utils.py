import os
from twilio.rest import Client

def send_whatsapp_invoice(to_number, order_id, invoice_url, customer_name):
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    from_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
    
    if not all([account_sid, auth_token, from_number]):
        print("WhatsApp credentials missing in .env file.")
        return False

    client = Client(account_sid, auth_token)
    
    # Strip prefixes to prevent duplicate formatting bugs
    clean_number = str(to_number).strip().replace("whatsapp:", "")
    formatted_to = f"whatsapp:{clean_number}"

    # Pre-approved Twilio Sandbox Template:
    # "Your {{1}} order of {{2}} has shipped and should be delivered on {{3}}. Details: {{4}}"
    sandbox_template_body = (
        f"Your Inni-Foods order of {order_id} has shipped and should be delivered on "
        f"today. Details: {invoice_url}"
    )

    try:
        message = client.messages.create(
            from_=from_number,
            body=sandbox_template_body,
            to=formatted_to
        )
        print(f"WhatsApp sent successfully! SID: {message.sid}")
        return True
    except Exception as e:
        print(f"WhatsApp failed: {str(e)}")
        return False

import logging

from django.conf import settings

from orders.invoice_tokens import build_signed_invoice_url, build_track_order_url
from orders.models import Order
from orders.serializers import resolve_order_customer_name
from orders.utils import get_order_contact_phone, normalize_phone

logger = logging.getLogger(__name__)


def _whatsapp_credentials_configured() -> bool:
    return bool(
        settings.TWILIO_ACCOUNT_SID
        and settings.TWILIO_AUTH_TOKEN
        and settings.TWILIO_WHATSAPP_NUMBER
    )


def format_whatsapp_recipient(phone: str) -> str | None:
    """Convert a 10-digit Indian mobile into a Twilio WhatsApp recipient."""
    digits = normalize_phone(phone)
    if len(digits) != 10:
        return None
    return f'whatsapp:+91{digits}'


def send_whatsapp_order_confirmation(
    *,
    to_number: str,
    order_number: str,
    customer_name: str,
    track_url: str,
    invoice_pdf_url: str | None = None,
) -> bool:
    """Send post-checkout WhatsApp with order confirmation, tracking link, and invoice PDF."""
    if not settings.WHATSAPP_NOTIFICATIONS_ENABLED:
        logger.warning(
            'WhatsApp notifications disabled (WHATSAPP_NOTIFICATIONS_ENABLED=False); '
            'skipping order %s',
            order_number,
        )
        return False

    if not _whatsapp_credentials_configured():
        logger.warning('Twilio WhatsApp credentials missing; skipping order %s', order_number)
        return False

    recipient = format_whatsapp_recipient(to_number)
    if not recipient:
        logger.warning('Invalid phone for WhatsApp on order %s: %r', order_number, to_number)
        return False

    body = (
        f'Hi {customer_name},\n\n'
        f'Your order *{order_number}* is confirmed. Payment received successfully.\n\n'
        f'Track your order here:\n{track_url}\n\n'
    )
    if invoice_pdf_url:
        body += 'Your invoice PDF is attached with full order details.'
    else:
        body += (
            'Download your invoice from the track order page after verifying your details.'
        )

    try:
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message_kwargs = {
            'from_': settings.TWILIO_WHATSAPP_NUMBER,
            'body': body,
            'to': recipient,
        }
        if invoice_pdf_url:
            message_kwargs['media_url'] = [invoice_pdf_url]

        message = client.messages.create(**message_kwargs)
        logger.info(
            'WhatsApp confirmation sent for order %s (SID: %s, media=%s)',
            order_number,
            message.sid,
            bool(invoice_pdf_url),
        )
        return True
    except Exception:
        logger.exception('WhatsApp failed for order %s', order_number)
        return False


def send_whatsapp_for_paid_order(order: Order) -> bool:
    """Send WhatsApp to the customer when checkout payment succeeds."""
    phone = get_order_contact_phone(order)
    if not phone:
        logger.info(
            'No phone on order %s; skipping WhatsApp notification',
            order.order_number,
        )
        return False

    invoice_pdf_url = build_signed_invoice_url(order)
    if not invoice_pdf_url:
        logger.debug(
            'API_PUBLIC_BASE_URL is not set; sending WhatsApp without PDF attachment '
            'for order %s. Set API_PUBLIC_BASE_URL to a public HTTPS URL (e.g. ngrok).',
            order.order_number,
        )

    return send_whatsapp_order_confirmation(
        to_number=phone,
        order_number=order.order_number,
        customer_name=resolve_order_customer_name(order),
        track_url=build_track_order_url(order, phone=phone),
        invoice_pdf_url=invoice_pdf_url,
    )

