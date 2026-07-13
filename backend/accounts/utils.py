from django.contrib.auth import get_user_model
from django.db.models import Q

from accounts.models import CustomUser

User = get_user_model()

SUPER_ADMIN_ROLE = CustomUser.Role.SUPER_ADMIN

ADMIN_VIEW_ROLES = {
    CustomUser.Role.SUPER_ADMIN,
    CustomUser.Role.ORDER_MANAGER,
    CustomUser.Role.SUPPORT_AGENT,
}

ORDER_STATUS_UPDATE_ROLES = {
    CustomUser.Role.SUPER_ADMIN,
    CustomUser.Role.ORDER_MANAGER,
}

CREATABLE_ADMIN_ROLES = {
    CustomUser.Role.SUPER_ADMIN,
    CustomUser.Role.ORDER_MANAGER,
    CustomUser.Role.SUPPORT_AGENT,
}


def get_user_role(user) -> str | None:
    if not user or not user.is_authenticated:
        return None
    if user.is_profile_active is False:
        return None
    return user.role


def user_is_super_admin(user) -> bool:
    return bool(user and user.is_authenticated and user.is_super_admin and user.is_active)


def get_super_admin_recipient_emails() -> list[str]:
    """Return active super admin emails for site notifications."""
    return list(
        User.objects.filter(
            role=CustomUser.Role.SUPER_ADMIN,
            is_active=True,
        )
        .filter(Q(is_profile_active=True) | Q(is_profile_active__isnull=True))
        .exclude(email='')
        .values_list('email', flat=True)
        .distinct(),
    )


def get_super_admin_by_email(email: str) -> User | None:
    """Look up an active Super Admin by email."""
    return User.objects.filter(
        email__iexact=email,
        role=CustomUser.Role.SUPER_ADMIN,
        is_active=True,
    ).filter(
        Q(is_profile_active=True) | Q(is_profile_active__isnull=True),
    ).first()


def get_admin_staff_by_email(email: str) -> User | None:
    """Look up an active admin-panel user by email (used for OTP login)."""
    return User.objects.filter(
        email__iexact=email,
        role__in=ADMIN_VIEW_ROLES,
        is_active=True,
    ).filter(
        Q(is_profile_active=True) | Q(is_profile_active__isnull=True),
    ).first()


def user_is_admin_staff(user) -> bool:
    return bool(user and user.is_authenticated and user.is_admin_staff and user.is_active)


def user_can_manage_orders(user) -> bool:
    return bool(user and user.is_authenticated and user.can_manage_orders and user.is_active)


def user_can_manage_users(user) -> bool:
    return bool(user and user.is_authenticated and user.can_manage_users and user.is_active)


def get_client_ip(request) -> str | None:
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')
