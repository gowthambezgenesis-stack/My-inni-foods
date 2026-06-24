import json
import logging

from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiResponse, extend_schema
from drf_spectacular.types import OpenApiTypes

from config.openapi_serializers import ErrorResponseSerializer, WebhookResponseSerializer

from .models import Payment
from .serializers import (
    CreateOrderResponseSerializer,
    CreateOrderSerializer,
    PaymentSerializer,
    VerifyPaymentSerializer,
)
from .utils import get_razorpay_client, verify_payment_signature, verify_webhook_signature

logger = logging.getLogger(__name__)


@extend_schema(
    tags=['Payment'],
    summary='Create legacy payment order',
    description='Deprecated standalone Razorpay order endpoint. Prefer POST /api/orders/create/.',
    request=CreateOrderSerializer,
    responses={201: CreateOrderResponseSerializer, 400: ErrorResponseSerializer},
)
class CreateOrderView(APIView):
    """
    Create a Razorpay order on the server and persist a pending Payment record.
    Amount is converted to paise (smallest currency unit) before calling Razorpay.
    """

    # AllowAny so guest checkout works; user is linked when authenticated
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning('Create order validation failed: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        amount = validated['amount']
        currency = validated['currency']
        notes = validated.get('notes', {})

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            logger.error('Razorpay credentials are not configured')
            return Response(
                {'error': 'Payment gateway is not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        order_id = Payment.generate_order_id()
        amount_in_paise = int(amount * 100)

        try:
            client = get_razorpay_client()
            razorpay_order = client.order.create(
                {
                    'amount': amount_in_paise,
                    'currency': currency,
                    'receipt': order_id,
                    'notes': {'internal_order_id': order_id, **notes},
                }
            )
        except Exception:
            logger.exception('Failed to create Razorpay order for %s', order_id)
            return Response(
                {'error': 'Unable to create payment order. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        user = request.user if request.user.is_authenticated else None
        payment = Payment.objects.create(
            order_id=order_id,
            razorpay_order_id=razorpay_order['id'],
            amount=amount,
            currency=currency,
            status=Payment.Status.PENDING,
            user=user,
            notes=notes,
        )

        logger.info(
            'Created payment order %s (Razorpay: %s) for user %s',
            order_id,
            razorpay_order['id'],
            user.pk if user else 'guest',
        )

        response_serializer = CreateOrderResponseSerializer(payment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Payment'],
    summary='Verify Razorpay payment',
    description='Verifies payment signature after Razorpay checkout success.',
    request=VerifyPaymentSerializer,
    responses={
        200: PaymentSerializer,
        400: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
class VerifyPaymentView(APIView):
    """
    Verify Razorpay payment signature after checkout success.
    Updates the Payment record status to success or failed.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning('Verify payment validation failed: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        razorpay_order_id = data['razorpay_order_id']
        razorpay_payment_id = data['razorpay_payment_id']
        razorpay_signature = data['razorpay_signature']

        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            logger.warning('Payment not found for Razorpay order %s', razorpay_order_id)
            return Response(
                {'error': 'Payment record not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Ensure the authenticated user owns this payment (if linked)
        if payment.user and payment.user != request.user:
            logger.warning(
                'User %s attempted to verify payment owned by user %s',
                request.user.pk,
                payment.user.pk,
            )
            return Response(
                {'error': 'You are not authorized to verify this payment.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        is_valid = verify_payment_signature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        )

        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = Payment.Status.SUCCESS if is_valid else Payment.Status.FAILED
        payment.save(update_fields=[
            'razorpay_payment_id',
            'razorpay_signature',
            'status',
            'updated_at',
        ])

        if not is_valid:
            logger.warning('Invalid signature for payment %s', payment.order_id)
            return Response(
                {'error': 'Payment verification failed. Invalid signature.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        logger.info('Payment verified successfully: %s', payment.order_id)
        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Payment'],
    summary='Razorpay webhook',
    description='Server-to-server webhook for payment.captured and payment.failed events.',
    request=OpenApiTypes.OBJECT,
    responses={200: WebhookResponseSerializer, 400: ErrorResponseSerializer},
)
@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    """
    Handle Razorpay webhook events (payment.captured, payment.failed, etc.).
    CSRF is exempt because Razorpay sends server-to-server POST requests.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature', '')
        body = request.body

        if not verify_webhook_signature(body, signature):
            logger.warning('Webhook rejected: invalid signature')
            return Response(
                {'error': 'Invalid webhook signature.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            logger.warning('Webhook rejected: invalid JSON payload')
            return Response(
                {'error': 'Invalid JSON payload.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = payload.get('event', '')
        entity = payload.get('payload', {}).get('payment', {}).get('entity', {})

        logger.info('Received Razorpay webhook event: %s', event)

        if event == 'payment.captured':
            self._handle_payment_captured(entity)
        elif event == 'payment.failed':
            self._handle_payment_failed(entity)
        else:
            logger.debug('Unhandled webhook event: %s', event)

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

    def _handle_payment_captured(self, entity: dict) -> None:
        razorpay_order_id = entity.get('order_id', '')
        razorpay_payment_id = entity.get('id', '')

        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            logger.warning(
                'Webhook payment.captured: no record for order %s',
                razorpay_order_id,
            )
            return

        if payment.status != Payment.Status.SUCCESS:
            payment.razorpay_payment_id = razorpay_payment_id
            payment.status = Payment.Status.SUCCESS
            payment.save(update_fields=['razorpay_payment_id', 'status', 'updated_at'])
            logger.info('Webhook updated payment %s to success', payment.order_id)

    def _handle_payment_failed(self, entity: dict) -> None:
        razorpay_order_id = entity.get('order_id', '')

        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            logger.warning(
                'Webhook payment.failed: no record for order %s',
                razorpay_order_id,
            )
            return

        payment.status = Payment.Status.FAILED
        payment.save(update_fields=['status', 'updated_at'])
        logger.info('Webhook updated payment %s to failed', payment.order_id)
