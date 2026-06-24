from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'order_id',
        'razorpay_order_id',
        'amount',
        'currency',
        'status',
        'user',
        'created_at',
    ]
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['order_id', 'razorpay_order_id', 'razorpay_payment_id']
    readonly_fields = [
        'order_id',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'created_at',
        'updated_at',
    ]
