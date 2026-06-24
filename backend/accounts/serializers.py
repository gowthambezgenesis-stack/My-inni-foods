from django.contrib.auth import get_user_model
from rest_framework import serializers

from .utils import ADMIN_VIEW_ROLES, CREATABLE_ADMIN_ROLES

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'phone',
            'role',
            'is_active',
            'is_profile_active',
            'last_login',
            'last_login_ip',
            'date_joined',
            'admin_notes',
        ]


class UserRoleUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=[(role.value, role.label) for role in ADMIN_VIEW_ROLES],
    )


class SendAdminOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyAdminOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate_otp(self, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) != 6 or not cleaned.isdigit():
            raise serializers.ValidationError('Enter the 6-digit code from your email.')
        return cleaned


class CreateAdminSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=[(role.value, role.label) for role in CREATABLE_ADMIN_ROLES],
    )
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email

