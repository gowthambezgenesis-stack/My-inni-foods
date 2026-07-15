"""
Django email backend that sends via SendGrid's HTTP API.

Avoids SMTP (blocked on many PaaS networks such as Railway) while keeping
the standard django.core.mail EmailMessage / EmailMultiAlternatives API.
SendGrid domain auth uses CNAME records, which Wix DNS supports.
"""

from __future__ import annotations

import base64
import json
import logging
import re
from email.utils import parseaddr
from typing import Any
from urllib import error, request

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.core.mail.message import EmailMessage, sanitize_address

logger = logging.getLogger(__name__)

SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send'


def _split_address(address: str) -> dict[str, str]:
    name, email = parseaddr(address)
    result: dict[str, str] = {'email': email or address}
    if name:
        result['name'] = name
    return result


class EmailBackend(BaseEmailBackend):
    def __init__(self, fail_silently: bool = False, **kwargs: Any) -> None:
        super().__init__(fail_silently=fail_silently)
        self.api_key = (getattr(settings, 'SENDGRID_API_KEY', '') or '').strip()

    def open(self) -> bool:
        return True

    def close(self) -> None:
        return None

    def send_messages(self, email_messages: list[EmailMessage]) -> int:
        if not email_messages:
            return 0
        if not self.api_key:
            if not self.fail_silently:
                raise RuntimeError('SENDGRID_API_KEY is not configured')
            logger.error('SENDGRID_API_KEY is not configured; cannot send email')
            return 0

        sent = 0
        for message in email_messages:
            try:
                self._send(message)
                sent += 1
            except Exception:
                logger.exception('SendGrid email send failed for subject=%r', message.subject)
                if not self.fail_silently:
                    raise
        return sent

    def _send(self, message: EmailMessage) -> None:
        payload = self._build_payload(message)
        body = json.dumps(payload).encode('utf-8')
        req = request.Request(
            SENDGRID_API_URL,
            data=body,
            method='POST',
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            },
        )
        try:
            with request.urlopen(req, timeout=30) as response:
                # SendGrid returns 202 Accepted with empty body on success.
                response.read()
        except error.HTTPError as exc:
            detail = exc.read().decode('utf-8', errors='replace')
            raise RuntimeError(f'SendGrid API error {exc.code}: {detail}') from exc
        except error.URLError as exc:
            raise RuntimeError(f'SendGrid API unreachable: {exc.reason}') from exc

    def _build_payload(self, message: EmailMessage) -> dict[str, Any]:
        encoding = message.encoding or settings.DEFAULT_CHARSET
        from_email = sanitize_address(
            message.from_email or settings.DEFAULT_FROM_EMAIL,
            encoding,
        )
        to = [sanitize_address(addr, encoding) for addr in message.to]
        if not to:
            raise ValueError('EmailMessage has no recipients')

        personalization: dict[str, Any] = {
            'to': [_split_address(addr) for addr in to],
        }
        if message.cc:
            personalization['cc'] = [
                _split_address(sanitize_address(addr, encoding)) for addr in message.cc
            ]
        if message.bcc:
            personalization['bcc'] = [
                _split_address(sanitize_address(addr, encoding)) for addr in message.bcc
            ]

        content: list[dict[str, str]] = []
        html_body = None
        for alt_content, mimetype in getattr(message, 'alternatives', None) or []:
            if mimetype == 'text/html':
                html_body = alt_content
                break

        if message.body:
            if message.content_subtype == 'html' and html_body is None:
                content.append({'type': 'text/html', 'value': message.body})
            else:
                content.append({'type': 'text/plain', 'value': message.body})
        if html_body is not None:
            content.append({'type': 'text/html', 'value': html_body})
        if not content:
            content.append({'type': 'text/plain', 'value': ''})

        payload: dict[str, Any] = {
            'personalizations': [personalization],
            'from': _split_address(from_email),
            'subject': message.subject or '',
            'content': content,
        }

        if message.reply_to:
            reply_to = [
                _split_address(sanitize_address(addr, encoding)) for addr in message.reply_to
            ]
            payload['reply_to'] = reply_to[0]
            if len(reply_to) > 1:
                payload['reply_to_list'] = reply_to

        attachments = self._build_attachments(message)
        if attachments:
            payload['attachments'] = attachments

        return payload

    def _build_attachments(self, message: EmailMessage) -> list[dict[str, str]]:
        attachments: list[dict[str, str]] = []
        for attachment in message.attachments:
            if isinstance(attachment, tuple) and len(attachment) >= 2:
                filename, content = attachment[0], attachment[1]
                mimetype = attachment[2] if len(attachment) >= 3 else 'application/octet-stream'
                if isinstance(content, str):
                    content_bytes = content.encode('utf-8')
                else:
                    content_bytes = content
                # SendGrid type field must look like a MIME type.
                mime = mimetype if re.match(r'^[\w.+-]+/[\w.+-]+$', str(mimetype)) else (
                    'application/octet-stream'
                )
                attachments.append(
                    {
                        'content': base64.b64encode(content_bytes).decode('ascii'),
                        'filename': filename,
                        'type': mime,
                        'disposition': 'attachment',
                    }
                )
        return attachments
