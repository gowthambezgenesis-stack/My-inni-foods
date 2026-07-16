"""Helpers for public frontend/admin URLs used in emails and deep links."""


def normalize_public_base_url(raw: str | None) -> str:
    """
    Normalize a site origin for email/deep links.

    Takes only the first value if a comma-separated list was pasted by mistake
    (common when copying from CORS_ALLOWED_ORIGINS), e.g. "innifoods.com,https".
    """
    if not raw:
        return ''
    value = str(raw).split(',')[0].strip().rstrip('/')
    if not value:
        return ''
    if value.lower() in {'http', 'https', 'http:', 'https:'}:
        return ''
    if '://' not in value:
        value = f'https://{value}'
    host_part = value.split('://', 1)[-1].split('/')[0]
    if ',' in host_part or ' ' in host_part:
        return ''
    return value.rstrip('/')
