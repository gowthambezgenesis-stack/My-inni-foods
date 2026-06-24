from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        'product_id',
        'product_name',
        'product_image',
        'quantity',
        'price_at_time',
        'weight',
    ]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number',
        'user',
        'total_amount',
        'status',
        'payment_status',
        'created_at',
    ]
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'razorpay_order_id', 'razorpay_payment_id']
    readonly_fields = [
        'order_number',
        'razorpay_order_id',
        'razorpay_payment_id',
        'created_at',
        'updated_at',
    ]
    inlines = [OrderItemInline]
