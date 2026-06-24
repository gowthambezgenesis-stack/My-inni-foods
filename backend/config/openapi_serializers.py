"""Serializers used for OpenAPI / Swagger documentation only."""

from rest_framework import serializers

from accounts.serializers import AdminUserSerializer
from orders.serializers import OrderListSerializer, OrderSerializer


class MessageResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()


class DetailResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()


class AuthUserDocSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.EmailField()
    full_name = serializers.CharField()
    role = serializers.CharField(allow_null=True)
    is_super_admin = serializers.BooleanField()
    is_admin_staff = serializers.BooleanField()


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    user = AuthUserDocSerializer()


class CreateAdminResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    email = serializers.EmailField()
    user = AdminUserSerializer()


class DashboardStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    todays_orders = serializers.IntegerField()
    paid_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    todays_sales = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    users_by_role = serializers.DictField(child=serializers.IntegerField())
    recent_orders = OrderListSerializer(many=True)
    is_super_admin = serializers.BooleanField()


class TokenRefreshResponseSerializer(serializers.Serializer):
    access = serializers.CharField()


class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, help_text='Optional if refresh cookie is set.')


class WebhookResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
