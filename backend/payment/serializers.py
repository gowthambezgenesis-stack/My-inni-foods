from decimal import Decimal

from rest_framework import serializers

from .models import Payment


class CreateOrderSerializer(serializers.Serializer):
    """Validates incoming data for creating a Razorpay order."""

    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('1'))
    currency = serializers.CharField(max_length=3, default='INR', required=False)
    notes = serializers.JSONField(required=False, default=dict)

    def validate_currency(self, value: str) -> str:
        return value.upper()


class CreateOrderResponseSerializer(serializers.ModelSerializer):
    """Response payload sent to the frontend to open Razorpay checkout."""

    key_id = serializers.SerializerMethodField()
    amount_paise = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'order_id',
            'razorpay_order_id',
            'amount',
            'amount_paise',
            'currency',
            'status',
            'key_id',
        ]

    def get_key_id(self, obj: Payment) -> str:
        from django.conf import settings

        return settings.RAZORPAY_KEY_ID

    def get_amount_paise(self, obj: Payment) -> int:
        return int(obj.amount * 100)


class VerifyPaymentSerializer(serializers.Serializer):
    """Validates payment verification payload from Razorpay checkout callback."""

    razorpay_order_id = serializers.CharField(max_length=100)
    razorpay_payment_id = serializers.CharField(max_length=100)
    razorpay_signature = serializers.CharField(max_length=255)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'order_id',
            'razorpay_order_id',
            'razorpay_payment_id',
            'amount',
            'currency',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields
