from django.urls import path

from .views import (
    AdminDashboardStatsView,
    AdminUserListView,
    AdminUserRemoveView,
    AdminUserRoleUpdateView,
    CreateAdminView,
    SendAdminOtpView,
    VerifyAdminOtpView,
)

urlpatterns = [
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/create/', CreateAdminView.as_view(), name='admin-user-create'),
    path('users/<int:id>/role/', AdminUserRoleUpdateView.as_view(), name='admin-user-role'),
    path('users/<int:id>/', AdminUserRemoveView.as_view(), name='admin-user-remove'),
    path('auth/send-otp/', SendAdminOtpView.as_view(), name='admin-send-otp'),
    path('auth/verify-otp/', VerifyAdminOtpView.as_view(), name='admin-verify-otp'),
]
