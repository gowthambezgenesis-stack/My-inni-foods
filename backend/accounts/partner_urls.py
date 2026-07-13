from django.urls import path

from .views import PartnerApplicationView

urlpatterns = [
    path('', PartnerApplicationView.as_view(), name='partner-application'),
]
