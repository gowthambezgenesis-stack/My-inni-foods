from django.urls import path

from .views import (
    OrderCreateView,
    OrderDetailView,
    OrderListView,
    OrderStatusUpdateView,
    TrackOrderInvoiceView,
    TrackOrderView,
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('track/', TrackOrderView.as_view(), name='order-track'),
    path('track/invoice/', TrackOrderInvoiceView.as_view(), name='order-track-invoice'),
    path('<int:id>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:id>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
]
