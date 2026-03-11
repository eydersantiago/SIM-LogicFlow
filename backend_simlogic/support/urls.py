from django.urls import path

from .views import (
    MaintenanceTypeDetailView,
    MaintenanceTypeListCreateView,
    MyRecordsView,
    SupportRecordDetailView,
    SupportRecordListCreateView,
)

urlpatterns = [
    path('maintenance-types/', MaintenanceTypeListCreateView.as_view(), name='maintenance-type-list-create'),
    path('maintenance-types/<int:pk>/', MaintenanceTypeDetailView.as_view(), name='maintenance-type-detail'),
    path('records/', SupportRecordListCreateView.as_view(), name='support-record-list-create'),
    path('records/<int:pk>/', SupportRecordDetailView.as_view(), name='support-record-detail'),
    path('my-records/', MyRecordsView.as_view(), name='my-records'),
]
