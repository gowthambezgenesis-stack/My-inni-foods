import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_admin_otp_email(email: str, otp: str) -> None:
    """Send 6-digit OTP to a registered Super Admin email via SMTP."""
    subject = f'{settings.EMAIL_SUBJECT_PREFIX}Your inni admin login code'
    message = (
        f'Your one-time login code is: {otp}\n\n'
        f'This code expires in {settings.ADMIN_OTP_TTL_MINUTES} minutes.\n'
        f'If you did not request this, ignore this email.\n\n'
        f'— inni Admin'
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
    logger.info('Admin OTP email sent to %s', email)
