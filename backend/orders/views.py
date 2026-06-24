import logging

from django.db.models import Q
from django.http import HttpResponse
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view

from accounts.permissions import IsOrderManager
from accounts.utils import user_is_admin_staff
from config.openapi_serializers import ErrorResponseSerializer

from .invoice import build_order_invoice_pdf
from .models import Order
from .serializers import (
    OrderCreateResponseSerializer,
    OrderCreateSerializer,
    OrderListSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    OrderTrackSerializer,
    TrackOrderLookupSerializer,
)
from .throttles import TrackInvoiceRateThrottle, TrackOrderRateThrottle
from .utils import order_matches_guest_credentials

logger = logging.getLogger(__name__)

TRACK_ORDER_NOT_FOUND = 'Order not found or the details do not match our records.'


def _lookup_verified_order(validated_data: dict) -> Order | None:
    order_number = validated_data['order_number']
    email = validated_data.get('email', '')
    mobile = validated_data.get('mobile', '')

    try:
        order = Order.objects.prefetch_related('items').select_related('user').get(
            order_number__iexact=order_number,
        )
    except Order.DoesNotExist:
        return None

    if not order_matches_guest_credentials(order, email=email, mobile=mobile):
        return None

    return order


@extend_schema_view(
    get=extend_schema(
        tags=['Orders'],
        summary='List orders',
        description='Customers see their own orders; admin roles see all orders.',
    ),
)
class OrderListView(ListAPIView):
    """
    GET /api/orders/
    Customers see their own orders; admin roles see all orders.
    """

    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.select_related('user').prefetch_related('items')

        status_filter = self.request.query_params.get('status')
        payment_status = self.request.query_params.get('payment_status')
        search = self.request.query_params.get('search')

        if user_is_admin_staff(user):
            qs = queryset
        else:
            qs = queryset.filter(user=user)

        if status_filter:
            qs = qs.filter(status=status_filter)
        if payment_status:
            qs = qs.filter(payment_status=payment_status)
        if search:
            search_q = (
                Q(order_number__icontains=search)
                | Q(shipping_address__city__icontains=search)
                | Q(shipping_address__state__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__full_name__icontains=search)
                | Q(shipping_address__firstName__icontains=search)
                | Q(shipping_address__lastName__icontains=search)
                | Q(shipping_address__phone__icontains=search)
                | Q(user__phone__icontains=search)
            )
            phone_digits = ''.join(ch for ch in search if ch.isdigit())
            if phone_digits:
                search_q |= Q(shipping_address__phone__icontains=phone_digits)
                search_q |= Q(user__phone__icontains=phone_digits)
            qs = qs.filter(search_q)

        return qs


@extend_schema_view(
    get=extend_schema(
        tags=['Orders'],
        summary='Get order detail',
        description='Order detail for the owner or an admin user.',
    ),
)
class OrderDetailView(RetrieveAPIView):
    """GET /api/orders/<id>/ — order detail for owner or admin."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.select_related('user').prefetch_related('items')
        if user_is_admin_staff(user):
            return queryset
        return queryset.filter(user=user)


@extend_schema(
    tags=['Orders'],
    summary='Create checkout order',
    description='Creates a pending order, line items, and Razorpay order for checkout.',
    request=OrderCreateSerializer,
    responses={
        201: OrderCreateResponseSerializer,
        400: ErrorResponseSerializer,
    },
)
class OrderCreateView(APIView):
    """
    POST /api/orders/create/
    Creates a pending Order, OrderItems, and Razorpay order for checkout.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OrderCreateSerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            logger.warning('Order create validation failed: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order = serializer.save()
        logger.info('Created order %s with Razorpay id %s', order.order_number, order.razorpay_order_id)

        response_serializer = OrderCreateResponseSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Orders'],
    summary='Update order fulfillment status',
    description='Restricted to super_admin and order_manager roles.',
    request=OrderStatusUpdateSerializer,
    responses={
        200: OrderSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
class OrderStatusUpdateView(APIView):
    """
    PATCH /api/orders/<id>/status/
    Restricted to super_admin and order_manager.
    """

    permission_classes = [IsAuthenticated, IsOrderManager]

    def patch(self, request, id):
        try:
            order = Order.objects.get(pk=id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        logger.info(
            'Order %s status updated to %s by user %s',
            order.order_number,
            order.status,
            request.user.pk,
        )
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Order Tracking'],
    summary='Track guest order',
    description='Lookup by order number plus email or mobile number used at checkout.',
    request=TrackOrderLookupSerializer,
    responses={
        200: OrderTrackSerializer,
        404: ErrorResponseSerializer,
    },
)
class TrackOrderView(APIView):
    """
    POST /api/orders/track/
    Guest order lookup using order number + email OR order number + mobile.
    """

    permission_classes = [AllowAny]
    throttle_classes = [TrackOrderRateThrottle]

    def post(self, request):
        serializer = TrackOrderLookupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order = _lookup_verified_order(serializer.validated_data)
        if not order:
            return Response({'error': TRACK_ORDER_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND)

        return Response(OrderTrackSerializer(order).data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Order Tracking'],
    summary='Download order invoice PDF',
    description='Returns a PDF invoice after the same verification used for order tracking.',
    request=TrackOrderLookupSerializer,
    responses={
        (200, 'application/pdf'): OpenApiResponse(description='Invoice PDF file'),
        404: ErrorResponseSerializer,
    },
)
class TrackOrderInvoiceView(APIView):
    """
    POST /api/orders/track/invoice/
    Download invoice PDF after verifying order number + email/mobile.
    """

    permission_classes = [AllowAny]
    throttle_classes = [TrackInvoiceRateThrottle]

    def post(self, request):
        serializer = TrackOrderLookupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order = _lookup_verified_order(serializer.validated_data)
        if not order:
            return Response({'error': TRACK_ORDER_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND)

        pdf_bytes = build_order_invoice_pdf(order)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice-{order.order_number}.pdf"'
        return response
