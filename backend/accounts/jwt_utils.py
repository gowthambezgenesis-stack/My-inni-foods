from django.conf import settings
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

REFRESH_COOKIE_NAME = 'inni_refresh_token'


def build_refresh_token(user) -> RefreshToken:
    from .utils import user_is_admin_staff, user_is_super_admin

    refresh = RefreshToken.for_user(user)
    refresh['email'] = user.email
    refresh['role'] = user.role or ''
    refresh['is_super_admin'] = user_is_super_admin(user)
    refresh['is_admin_staff'] = user_is_admin_staff(user)
    return refresh


def build_user_payload(user) -> dict:
    from .utils import user_is_admin_staff, user_is_super_admin

    return {
        'id': str(user.id),
        'email': user.email,
        'full_name': user.full_name or user.get_full_name() or user.username,
        'role': user.role,
        'is_super_admin': user_is_super_admin(user),
        'is_admin_staff': user_is_admin_staff(user),
    }


def issue_token_response(user, status_code=200) -> Response:
    """Return access token in JSON and refresh token in HttpOnly cookie."""
    refresh = build_refresh_token(user)
    access = str(refresh.access_token)

    response = Response(
        {
            'access': access,
            'user': build_user_payload(user),
        },
        status=status_code,
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=str(refresh),
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        path=settings.JWT_COOKIE_PATH,
    )
    return response


def clear_refresh_cookie(response: Response) -> Response:
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path=settings.JWT_COOKIE_PATH,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )
    return response
