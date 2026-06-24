import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count, DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema, extend_schema_view

from config.openapi_serializers import (
    AuthResponseSerializer,
    CreateAdminResponseSerializer,
    DashboardStatsSerializer,
    DetailResponseSerializer,
    ErrorResponseSerializer,
    LogoutRequestSerializer,
    MessageResponseSerializer,
    TokenRefreshResponseSerializer,
)

from orders.models import Order
from orders.serializers import OrderListSerializer

from .email_service import send_admin_otp_email
from .jwt_utils import REFRESH_COOKIE_NAME, clear_refresh_cookie, issue_token_response
from .models import AdminLoginOtp, CustomUser
from .permissions import IsAdminStaff, IsSuperAdmin
from .serializers import (
    AdminUserSerializer,
    CreateAdminSerializer,
    SendAdminOtpSerializer,
    UserRoleUpdateSerializer,
    VerifyAdminOtpSerializer,
)
from .utils import ADMIN_VIEW_ROLES, get_admin_staff_by_email, get_client_ip, user_is_super_admin

User = get_user_model()

logger = logging.getLogger(__name__)

GENERIC_OTP_MESSAGE = (
    'If this email is registered as an admin, a verification code has been sent.'
)


@extend_schema_view(
    post=extend_schema(
        tags=['Auth'],
        summary='Refresh JWT access token',
        description='Reads refresh token from HttpOnly cookie or request body.',
        responses={
            200: TokenRefreshResponseSerializer,
            401: DetailResponseSerializer,
        },
    ),
)
class CookieTokenRefreshView(TokenRefreshView):
    """
    POST /api/auth/refresh/
    Reads refresh token from HttpOnly cookie or request body.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh') or request.COOKIES.get(REFRESH_COOKIE_NAME)
        if not refresh_token:
            return Response({'detail': 'Refresh token required.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0]) from exc

        from django.conf import settings as django_settings

        response = Response({'access': serializer.validated_data['access']})
        if django_settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS') and 'refresh' in serializer.validated_data:
            response.set_cookie(
                key=REFRESH_COOKIE_NAME,
                value=serializer.validated_data['refresh'],
                max_age=int(django_settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
                httponly=True,
                secure=django_settings.JWT_COOKIE_SECURE,
                samesite=django_settings.JWT_COOKIE_SAMESITE,
                path=django_settings.JWT_COOKIE_PATH,
            )
        return response


@extend_schema(
    tags=['Auth'],
    summary='Logout',
    description='Blacklist refresh token and clear the HttpOnly cookie.',
    request=LogoutRequestSerializer,
    responses={200: DetailResponseSerializer},
)
class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist refresh token and clear cookie."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh') or request.COOKIES.get(REFRESH_COOKIE_NAME)
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass
        response = Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)
        return clear_refresh_cookie(response)


@extend_schema(
    tags=['Admin Auth'],
    summary='Send admin login OTP',
    description='Sends a one-time code only to registered active admin emails.',
    request=SendAdminOtpSerializer,
    responses={200: MessageResponseSerializer, 503: ErrorResponseSerializer},
)
class SendAdminOtpView(APIView):
    """
    POST /api/admin/auth/send-otp/
    Sends OTP only to emails registered as active admin users in the database.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendAdminOtpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        user = get_admin_staff_by_email(email)

        if not user:
            logger.warning('OTP requested for non-admin email: %s', email)
            return Response({'message': GENERIC_OTP_MESSAGE}, status=status.HTTP_200_OK)

        _, plain_otp = AdminLoginOtp.create_for_email(email)

        if not settings.EMAIL_CONFIGURED:
            logger.error('SMTP not configured: set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env')
            return Response(
                {'error': 'Email service is not configured. Set SMTP credentials in .env and restart the server.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            send_admin_otp_email(email, plain_otp)
        except Exception:
            logger.exception('Failed to send OTP email to %s', email)
            return Response(
                {'error': 'Unable to send verification email. Check SMTP settings and restart the server after changing .env.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        logger.info('OTP sent to admin %s', email)
        return Response({'message': GENERIC_OTP_MESSAGE}, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Admin Auth'],
    summary='Verify admin OTP',
    description='Verifies emailed OTP and returns JWT access token (refresh in HttpOnly cookie).',
    request=VerifyAdminOtpSerializer,
    responses={200: AuthResponseSerializer, 400: ErrorResponseSerializer},
)
class VerifyAdminOtpView(APIView):
    """
    POST /api/admin/auth/verify-otp/
    Verifies emailed OTP and returns JWT (refresh in HttpOnly cookie).
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyAdminOtpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        otp = serializer.validated_data['otp']

        user = get_admin_staff_by_email(email)
        if not user:
            logger.warning('OTP verify failed: no admin user for %s', email)
            return Response({'error': 'Invalid verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record = (
            AdminLoginOtp.objects.filter(email=email, is_used=False)
            .order_by('-created_at')
            .first()
        )
        if not otp_record:
            logger.warning('OTP verify failed: no active code for %s', email)
            return Response(
                {'error': 'No active code found. Click “Resend code” and use the latest email.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if otp_record.is_expired():
            logger.warning('OTP verify failed: expired code for %s', email)
            return Response(
                {'error': 'This code has expired. Request a new one to continue.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if otp_record.attempts >= AdminLoginOtp.MAX_ATTEMPTS:
            logger.warning('OTP verify failed: max attempts for %s', email)
            return Response(
                {'error': 'Too many incorrect attempts. Request a new code.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not otp_record.verify(otp):
            remaining = AdminLoginOtp.MAX_ATTEMPTS - otp_record.attempts
            logger.warning('OTP verify failed: wrong code for %s (%s attempts left)', email, remaining)
            return Response(
                {'error': f'Incorrect code. {remaining} attempt{"s" if remaining != 1 else ""} remaining.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.last_login_ip = get_client_ip(request)
        user.save(update_fields=['last_login_ip'])

        logger.info('Admin %s verified OTP successfully', email)
        return issue_token_response(user)


@extend_schema(
    tags=['Admin Users'],
    summary='Create admin user',
    description='Super Admin creates a new admin user for OTP-based login.',
    request=CreateAdminSerializer,
    responses={201: CreateAdminResponseSerializer, 400: ErrorResponseSerializer},
)
class CreateAdminView(APIView):
    """
    POST /api/admin/users/create/
    Super Admin creates a new admin user (OTP login, no password).
    """

    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = CreateAdminSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        role = serializer.validated_data['role']
        full_name = serializer.validated_data.get('full_name') or email.split('@')[0].replace('.', ' ').title()

        user = User.objects.create_user(
            email=email,
            full_name=full_name,
            role=role,
            is_active=True,
            is_staff=True,
            is_superuser=role == CustomUser.Role.SUPER_ADMIN,
            is_profile_active=True,
        )

        logger.info('Admin user %s created with role %s by %s', email, role, request.user.email)
        return Response(
            {
                'message': 'Admin created successfully. They can login using their email.',
                'email': email,
                'user': AdminUserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=['Admin Dashboard'],
    summary='Dashboard statistics',
    description='Returns order counts, revenue (role-dependent), and recent orders.',
    responses={200: DashboardStatsSerializer},
)
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminStaff]

    def get(self, request):
        today = timezone.now().date()
        paid_qs = Order.objects.filter(payment_status=Order.PaymentStatus.PAID)
        zero_revenue = Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))
        is_super = user_is_super_admin(request.user)

        stats = {
            'total_orders': Order.objects.count(),
            'pending_orders': Order.objects.filter(
                Q(status=Order.Status.PENDING) | Q(payment_status=Order.PaymentStatus.PENDING)
            ).count(),
            'todays_orders': Order.objects.filter(created_at__date=today).count(),
            'paid_orders': paid_qs.count(),
        }

        if is_super:
            stats['total_revenue'] = paid_qs.aggregate(
                total=Coalesce(Sum('total_amount'), zero_revenue),
            )['total']
            stats['todays_sales'] = paid_qs.filter(created_at__date=today).aggregate(
                total=Coalesce(Sum('total_amount'), zero_revenue),
            )['total']
            role_counts = User.objects.values('role').annotate(count=Count('id')).order_by('role')
            stats['users_by_role'] = {item['role']: item['count'] for item in role_counts}
        else:
            stats['total_revenue'] = None
            stats['todays_sales'] = None
            stats['users_by_role'] = {}

        recent_limit = 20 if is_super else 10
        recent_orders = Order.objects.select_related('user').order_by('-created_at')[:recent_limit]
        stats['recent_orders'] = OrderListSerializer(recent_orders, many=True).data
        stats['is_super_admin'] = is_super

        return Response(stats)


@extend_schema_view(
    get=extend_schema(
        tags=['Admin Users'],
        summary='List admin users',
        description='Super Admin only. Filter by role or search query params.',
    ),
)
class AdminUserListView(ListAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        qs = (
            User.objects.filter(role__in=ADMIN_VIEW_ROLES)
            .filter(Q(is_profile_active=True) | Q(is_profile_active__isnull=True))
            .order_by('-date_joined')
        )
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(username__icontains=search)
                | Q(full_name__icontains=search)
                | Q(phone__icontains=search)
            )
        return qs


@extend_schema(
    tags=['Admin Users'],
    summary='Update admin role',
    request=UserRoleUpdateSerializer,
    responses={
        200: AdminUserSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
class AdminUserRoleUpdateView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, id):
        try:
            user = User.objects.get(pk=id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user and request.data.get('role') != CustomUser.Role.SUPER_ADMIN:
            return Response(
                {'error': 'You cannot demote your own Super Admin account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = UserRoleUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user.role = serializer.validated_data['role']
        user.is_superuser = user.role == CustomUser.Role.SUPER_ADMIN
        user.save(update_fields=['role', 'is_superuser'])
        return Response(AdminUserSerializer(user).data)


@extend_schema(
    tags=['Admin Users'],
    summary='Remove admin user',
    description='Super Admin revokes an admin user\'s panel access.',
    responses={
        200: MessageResponseSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
class AdminUserRemoveView(APIView):
    """
    DELETE /api/admin/users/<id>/
    Super Admin revokes an admin user's panel access.
    """

    permission_classes = [IsSuperAdmin]

    def delete(self, request, id):
        try:
            user = User.objects.get(pk=id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response(
                {'error': 'You cannot remove your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.role not in ADMIN_VIEW_ROLES:
            return Response({'error': 'This user is not an admin.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.role == CustomUser.Role.SUPER_ADMIN:
            remaining_super_admins = User.objects.filter(
                role=CustomUser.Role.SUPER_ADMIN,
                is_active=True,
            ).filter(
                Q(is_profile_active=True) | Q(is_profile_active__isnull=True),
            ).exclude(pk=user.pk).count()
            if remaining_super_admins == 0:
                return Response(
                    {'error': 'Cannot remove the last Super Admin.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user.is_profile_active = False
        user.is_staff = False
        user.is_superuser = False
        user.save(update_fields=['is_profile_active', 'is_staff', 'is_superuser'])

        logger.info('Admin user %s removed by %s', user.email, request.user.email)
        return Response({'message': 'Admin removed successfully.'})
