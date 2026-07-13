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


def send_contact_message_email(
    *,
    name: str,
    email: str,
    subject: str,
    message: str,
    recipient_emails: list[str],
) -> None:
    """Forward a storefront contact form submission to super admin inboxes."""
    from django.core.mail import EmailMessage

    body = (
        f'New message from the inni contact form.\n\n'
        f'Name: {name}\n'
        f'Email: {email}\n'
        f'Subject: {subject}\n\n'
        f'Message:\n{message}\n\n'
        f'— inni Products'
    )
    mail = EmailMessage(
        subject=f'{settings.EMAIL_SUBJECT_PREFIX}Contact: {subject}',
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipient_emails,
        reply_to=[email],
    )
    mail.send(fail_silently=False)
    logger.info('Contact form email sent to %d super admin(s)', len(recipient_emails))


def send_partner_application_email(
    *,
    business_name: str,
    email: str,
    partnership_type: str,
    recipient_emails: list[str],
    message: str = '',
) -> None:
    """Forward a partner application to super admin inboxes."""
    from django.core.mail import EmailMessage

    body = (
        f'New partner application from the inni website.\n\n'
        f'Business Name: {business_name}\n'
        f'Email: {email}\n'
        f'Partnership Type: {partnership_type}\n'
    )
    if message:
        body += f'\nAdditional Notes:\n{message}\n'
    body += '\n— inni Products'

    mail = EmailMessage(
        subject=f'{settings.EMAIL_SUBJECT_PREFIX}Partner application: {business_name}',
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipient_emails,
        reply_to=[email],
    )
    mail.send(fail_silently=False)
    logger.info('Partner application email sent to %d super admin(s)', len(recipient_emails))
