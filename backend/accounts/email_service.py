import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def send_admin_otp_email(email: str, otp: str) -> None:
    """Send 6-digit OTP to a registered admin email via SendGrid HTTP API."""
    subject = f'{settings.EMAIL_SUBJECT_PREFIX}Your inni admin login code'
    ttl = settings.ADMIN_OTP_TTL_MINUTES

    text_body = (
        f'Your one-time login code is:\n\n'
        f'{otp}\n\n'
        f'This code expires in {ttl} minutes.\n'
        f'If you did not request this, ignore this email.\n\n'
        f'— inni Admin'
    )

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin login code</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="background:#111111;padding:24px 28px;">
              <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#a1a1aa;">inni Admin</p>
              <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;color:#ffffff;">Your login code</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#52525b;">
                Use this one-time code to sign in to the admin panel.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                <tr>
                  <td align="center" style="background:#111111;border-radius:12px;padding:22px 16px;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a1a1aa;font-weight:bold;">
                      OTP code
                    </p>
                    <p style="margin:0;font-size:40px;line-height:1.1;letter-spacing:0.28em;font-weight:bold;color:#ffffff;font-family:ui-monospace,Consolas,monospace;">
                      {otp}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#71717a;">
                This code expires in <strong style="color:#18181b;">{ttl} minutes</strong>.
                If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    message.attach_alternative(html_body, 'text/html')
    message.send(fail_silently=False)
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
