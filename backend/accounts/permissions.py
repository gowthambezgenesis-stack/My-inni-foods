from rest_framework.permissions import BasePermission

from .utils import user_can_manage_orders, user_can_manage_users, user_is_admin_staff, user_is_super_admin


class IsSuperAdmin(BasePermission):
    """Only active Super Admin users — highest privilege level."""

    message = 'Super Admin access required.'

    def has_permission(self, request, view) -> bool:
        return user_is_super_admin(request.user)


class IsAdminStaff(BasePermission):
    """Allows admin panel roles to access staff-only endpoints."""

    def has_permission(self, request, view) -> bool:
        return user_is_admin_staff(request.user)


class IsOrderManager(BasePermission):
    """Super Admin only — full order management access."""

    def has_permission(self, request, view) -> bool:
        return user_can_manage_orders(request.user)


class IsUserManager(BasePermission):
    """Super Admin only — user and role management."""

    def has_permission(self, request, view) -> bool:
        return user_can_manage_users(request.user)
