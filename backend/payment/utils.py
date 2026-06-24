import hashlib
import hmac
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def get_razorpay_client():
    """Return a configured Razorpay client instance."""
    import razorpay

    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def verify_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    """
    Verify Razorpay payment signature using HMAC SHA256.
    Razorpay signs: order_id|payment_id
    """
    message = f'{razorpay_order_id}|{razorpay_payment_id}'
    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256,
    ).hexdigest()

    is_valid = hmac.compare_digest(generated_signature, razorpay_signature)
    if not is_valid:
        logger.warning(
            'Payment signature verification failed for order %s',
            razorpay_order_id,
        )
    return is_valid


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    """
    Verify Razorpay webhook signature.
    Uses RAZORPAY_WEBHOOK_SECRET if set, otherwise falls back to KEY_SECRET.
    """
    webhook_secret = getattr(
        settings, 'RAZORPAY_WEBHOOK_SECRET', settings.RAZORPAY_KEY_SECRET
    )
    expected = hmac.new(
        webhook_secret.encode('utf-8'),
        body,
        hashlib.sha256,
    ).hexdigest()

    is_valid = hmac.compare_digest(expected, signature)
    if not is_valid:
        logger.warning('Webhook signature verification failed')
    return is_valid
