"""
Django email backend that sends via Resend's HTTP API.

Avoids SMTP (blocked on many PaaS networks such as Railway) while keeping
the standard django.core.mail EmailMessage / EmailMultiAlternatives API.
"""

from __future__ import annotations

import json
import logging
from typing import Any
from urllib import error, request

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.core.mail.message import EmailMessage, sanitize_address

logger = logging.getLogger(__name__)

RESEND_API_URL = 'https://api.resend.com/emails'


class EmailBackend(BaseEmailBackend):
    def __init__(self, fail_silently: bool = False, **kwargs: Any) -> None:
        super().__init__(fail_silently=fail_silently)
        self.api_key = (getattr(settings, 'RESEND_API_KEY', '') or '').strip()

    def open(self) -> bool:
        return True

    def close(self) -> None:
        return None

    def send_messages(self, email_messages: list[EmailMessage]) -> int:
        if not email_messages:
            return 0
        if not self.api_key:
            if not self.fail_silently:
                raise RuntimeError('RESEND_API_KEY is not configured')
            logger.error('RESEND_API_KEY is not configured; cannot send email')
            return 0

        sent = 0
        for message in email_messages:
            try:
                self._send(message)
                sent += 1
            except Exception:
                logger.exception('Resend email send failed for subject=%r', message.subject)
                if not self.fail_silently:
                    raise
        return sent

    def _send(self, message: EmailMessage) -> None:
        payload = self._build_payload(message)
        body = json.dumps(payload).encode('utf-8')
        req = request.Request(
            RESEND_API_URL,
            data=body,
            method='POST',
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        )
        try:
            with request.urlopen(req, timeout=30) as response:
                response.read()
        except error.HTTPError as exc:
            detail = exc.read().decode('utf-8', errors='replace')
            raise RuntimeError(f'Resend API error {exc.code}: {detail}') from exc
        except error.URLError as exc:
            raise RuntimeError(f'Resend API unreachable: {exc.reason}') from exc

    def _build_payload(self, message: EmailMessage) -> dict[str, Any]:
        encoding = message.encoding or settings.DEFAULT_CHARSET
        from_email = sanitize_address(
            message.from_email or settings.DEFAULT_FROM_EMAIL,
            encoding,
        )
        to = [sanitize_address(addr, encoding) for addr in message.to]
        if not to:
            raise ValueError('EmailMessage has no recipients')

        payload: dict[str, Any] = {
            'from': from_email,
            'to': to,
            'subject': message.subject or '',
        }

        if message.cc:
            payload['cc'] = [sanitize_address(addr, encoding) for addr in message.cc]
        if message.bcc:
            payload['bcc'] = [sanitize_address(addr, encoding) for addr in message.bcc]
        if message.reply_to:
            reply_to = [sanitize_address(addr, encoding) for addr in message.reply_to]
            payload['reply_to'] = reply_to[0] if len(reply_to) == 1 else reply_to

        html_body = None
        for content, mimetype in getattr(message, 'alternatives', None) or []:
            if mimetype == 'text/html':
                html_body = content
                break

        if html_body is not None:
            payload['html'] = html_body
            if message.body:
                payload['text'] = message.body
        elif message.content_subtype == 'html':
            payload['html'] = message.body or ''
        else:
            payload['text'] = message.body or ''

        attachments = self._build_attachments(message)
        if attachments:
            payload['attachments'] = attachments

        return payload

    def _build_attachments(self, message: EmailMessage) -> list[dict[str, str]]:
        import base64

        attachments: list[dict[str, str]] = []
        for attachment in message.attachments:
            if isinstance(attachment, tuple) and len(attachment) >= 2:
                filename, content = attachment[0], attachment[1]
                if isinstance(content, str):
                    content_bytes = content.encode('utf-8')
                else:
                    content_bytes = content
                attachments.append(
                    {
                        'filename': filename,
                        'content': base64.b64encode(content_bytes).decode('ascii'),
                    }
                )
        return attachments
