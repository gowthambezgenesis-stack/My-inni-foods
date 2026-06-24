from decimal import Decimal
import re

from django.conf import settings
from rest_framework import serializers

from accounts.utils import user_is_admin_staff

from .models import Order, OrderItem


def resolve_order_customer_name(order: Order) -> str:
    """Prefer checkout shipping name, then linked user profile fields."""
    address = order.shipping_address or {}
    shipping_name = f"{address.get('firstName', '')} {address.get('lastName', '')}".strip()
    if shipping_name:
        return shipping_name

    user = order.user
    if user:
        user_first_last = f'{user.first_name} {user.last_name}'.strip()
        if user_first_last:
            return user_first_last
        if user.full_name:
            return user.full_name.strip()
        return user.username or user.email or 'Guest'

    return 'Guest'


class ShippingAddressSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=100)
    lastName = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=500)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    zip = serializers.CharField(max_length=20)

    def validate_phone(self, value: str) -> str:
        if re.search(r'[a-zA-Z]', value):
            raise serializers.ValidationError('Enter valid number.')
        digits = re.sub(r'\D', '', value.strip())
        if len(digits) != 10:
            raise serializers.ValidationError('Enter valid number.')
        return digits


class OrderItemSerializer(serializers.ModelSerializer):
    product_slug = serializers.CharField(source='product_id', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'product_slug',
            'product_image',
            'quantity',
            'price_at_time',
            'weight',
        ]
        read_only_fields = fields


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    name = serializers.CharField(required=False, allow_blank=True, default='')
    image = serializers.URLField(required=False, allow_blank=True, default='')
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'))
    weight = serializers.CharField(required=False, allow_blank=True, default='')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'user',
            'user_email',
            'total_amount',
            'status',
            'payment_status',
            'shipping_address',
            'razorpay_order_id',
            'razorpay_payment_id',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_user_email(self, obj: Order) -> str | None:
        from .utils import get_order_contact_email

        return get_order_contact_email(obj)


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order list views."""

    items_count = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'user_email',
            'username',
            'customer_name',
            'total_amount',
            'status',
            'payment_status',
            'shipping_address',
            'items_count',
            'created_at',
            'updated_at',
        ]

    def get_items_count(self, obj: Order) -> int:
        return obj.items.count()

    def get_user_email(self, obj: Order) -> str | None:
        from .utils import get_order_contact_email

        return get_order_contact_email(obj)

    def get_username(self, obj: Order) -> str | None:
        if not obj.user:
            return None
        return obj.user.username

    def get_customer_name(self, obj: Order) -> str:
        return resolve_order_customer_name(obj)


class OrderCreateSerializer(serializers.Serializer):
    """Validates checkout payload and creates order + Razorpay order."""

    email = serializers.EmailField(required=False, allow_blank=True)
    shipping_address = ShippingAddressSerializer()
    items = OrderItemCreateSerializer(many=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('1'))
    shipping_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False, default=Decimal('0')
    )
    currency = serializers.CharField(max_length=3, default='INR', required=False)

    def validate_currency(self, value: str) -> str:
        return value.upper()

    def validate_items(self, value: list) -> list:
        if not value:
            raise serializers.ValidationError('At least one item is required.')
        return value

    def validate_email(self, value: str) -> str:
        return value.strip().lower()

    def validate(self, attrs: dict) -> dict:
        items = attrs['items']
        shipping_amount = attrs.get('shipping_amount', Decimal('0'))
        computed_total = sum(
            Decimal(str(item['price'])) * item['quantity'] for item in items
        ) + shipping_amount
        if computed_total != attrs['total_amount']:
            raise serializers.ValidationError(
                {'total_amount': 'Total amount does not match cart items plus shipping.'}
            )
        return attrs

    def create(self, validated_data: dict) -> Order:
        from payment.models import Payment
        from payment.utils import get_razorpay_client

        request = self.context['request']
        user = request.user if request.user.is_authenticated else None
        if user and user_is_admin_staff(user):
            user = None

        items_data = validated_data['items']
        email = validated_data.get('email', '')
        shipping_address = dict(validated_data['shipping_address'])
        if email:
            shipping_address['email'] = email
        total_amount = validated_data['total_amount']
        currency = validated_data.get('currency', 'INR')

        order_number = Order.generate_order_number()
        order = Order.objects.create(
            order_number=order_number,
            user=user,
            total_amount=total_amount,
            status=Order.Status.PENDING,
            payment_status=Order.PaymentStatus.PENDING,
            shipping_address=shipping_address,
        )

        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=item_data['product_id'],
                product_name=item_data.get('name') or item_data['product_id'],
                product_image=item_data.get('image', ''),
                quantity=item_data['quantity'],
                price_at_time=item_data['price'],
                weight=item_data.get('weight', ''),
            )

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            order.delete()
            raise serializers.ValidationError('Payment gateway is not configured.')

        amount_in_paise = int(total_amount * 100)
        try:
            client = get_razorpay_client()
            razorpay_order = client.order.create(
                {
                    'amount': amount_in_paise,
                    'currency': currency,
                    'receipt': order_number,
                    'notes': {
                        'order_number': order_number,
                        'email': validated_data.get('email', ''),
                    },
                }
            )
        except Exception as exc:
            order.delete()
            raise serializers.ValidationError(
                'Unable to create payment order. Please try again.'
            ) from exc

        order.razorpay_order_id = razorpay_order['id']
        order.save(update_fields=['razorpay_order_id', 'updated_at'])

        Payment.objects.create(
            order_id=order_number,
            razorpay_order_id=razorpay_order['id'],
            amount=total_amount,
            currency=currency,
            status=Payment.Status.PENDING,
            user=user,
            notes={
                'order_id': order.id,
                'order_number': order_number,
                'email': validated_data.get('email', ''),
                'shipping_address': shipping_address,
            },
        )

        return order


class OrderCreateResponseSerializer(serializers.ModelSerializer):
    """Response for checkout: order details + Razorpay checkout fields."""

    key_id = serializers.SerializerMethodField()
    amount_paise = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'total_amount',
            'amount_paise',
            'status',
            'payment_status',
            'shipping_address',
            'razorpay_order_id',
            'key_id',
            'currency',
            'items',
            'created_at',
        ]

    def get_key_id(self, obj: Order) -> str:
        return settings.RAZORPAY_KEY_ID

    def get_amount_paise(self, obj: Order) -> int:
        return int(obj.total_amount * 100)

    def get_currency(self, obj: Order) -> str:
        return 'INR'


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def validate_status(self, value: str) -> str:
        allowed = {
            Order.Status.PROCESSING,
            Order.Status.SHIPPING,
            Order.Status.OUT_FOR_DELIVERY,
            Order.Status.DELIVERED,
        }
        if value not in allowed:
            raise serializers.ValidationError(
                'Invalid status. Choose from: processing, shipping, out_for_delivery, delivered.',
            )
        return value


class TrackOrderLookupSerializer(serializers.Serializer):
    order_number = serializers.CharField(max_length=50)
    email = serializers.EmailField(required=False, allow_blank=True)
    mobile = serializers.CharField(required=False, allow_blank=True, max_length=20)

    def validate(self, attrs: dict) -> dict:
        email = (attrs.get('email') or '').strip().lower()
        mobile = (attrs.get('mobile') or '').strip()

        if bool(email) == bool(mobile):
            raise serializers.ValidationError(
                'Provide either email or mobile number to verify your order.',
            )

        if mobile:
            digits = re.sub(r'\D', '', mobile)
            if len(digits) != 10:
                raise serializers.ValidationError({'mobile': 'Enter a valid 10-digit mobile number.'})
            attrs['mobile'] = digits

        attrs['email'] = email
        attrs['order_number'] = attrs['order_number'].strip().upper()
        return attrs


class OrderTrackSerializer(serializers.ModelSerializer):
    """Public-safe order payload for guest tracking."""

    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()
    payment_status_label = serializers.SerializerMethodField()
    order_date = serializers.DateTimeField(source='created_at', read_only=True)
    tracking_info = serializers.SerializerMethodField()
    estimated_delivery_date = serializers.SerializerMethodField()
    tracking_history = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'order_number',
            'status',
            'status_label',
            'order_date',
            'updated_at',
            'items',
            'total_amount',
            'payment_status',
            'payment_status_label',
            'shipping_address',
            'customer_name',
            'customer_email',
            'tracking_info',
            'estimated_delivery_date',
            'tracking_history',
        ]

    def get_customer_name(self, obj: Order) -> str:
        return resolve_order_customer_name(obj)

    def get_status_label(self, obj: Order) -> str:
        from .utils import get_order_display_status

        return get_order_display_status(obj)

    def get_payment_status_label(self, obj: Order) -> str:
        return obj.get_payment_status_display()

    def get_tracking_info(self, obj: Order) -> dict | None:
        from .utils import get_order_tracking_info

        return get_order_tracking_info(obj)

    def get_estimated_delivery_date(self, obj: Order) -> str | None:
        from .utils import get_estimated_delivery_date

        return get_estimated_delivery_date(obj)

    def get_tracking_history(self, obj: Order) -> list[dict]:
        from .utils import build_order_tracking_history

        return build_order_tracking_history(obj)

    def get_customer_email(self, obj: Order) -> str | None:
        from .utils import get_order_contact_email

        return get_order_contact_email(obj)
