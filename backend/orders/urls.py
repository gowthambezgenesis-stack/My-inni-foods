from django.urls import path

from .views import (
    OrderCreateView,
    OrderDetailExportView,
    OrderDetailView,
    OrderExportView,
    OrderListView,
    OrderStatusUpdateView,
    SignedOrderInvoiceView,
    TrackOrderInvoiceView,
    TrackOrderView,
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('export/', OrderExportView.as_view(), name='order-export'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('track/', TrackOrderView.as_view(), name='order-track'),
    path('track/invoice/', TrackOrderInvoiceView.as_view(), name='order-track-invoice'),
    path(
        'invoice/<str:order_number>/<str:token>/',
        SignedOrderInvoiceView.as_view(),
        name='order-signed-invoice',
    ),
    path('<int:id>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:id>/export/', OrderDetailExportView.as_view(), name='order-detail-export'),
    path('<int:id>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
]
