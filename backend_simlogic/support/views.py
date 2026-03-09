from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MaintenanceType, SupportRecord
from .permissions import (
    IsAdminOrReadOnlyForSupport,
    IsSupportOrAdmin,
    IsSupportRecordOwnerOrAdmin,
)
from .serializers import (
    MaintenanceTypeSerializer,
    SupportRecordSerializer,
    SupportRecordUpdateSerializer,
)


class MaintenanceTypeListCreateView(generics.ListCreateAPIView):
    queryset = MaintenanceType.objects.all()
    serializer_class = MaintenanceTypeSerializer
    permission_classes = (IsAdminOrReadOnlyForSupport,)

    def get_queryset(self):
        queryset = MaintenanceType.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


class MaintenanceTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MaintenanceType.objects.all()
    serializer_class = MaintenanceTypeSerializer
    permission_classes = (IsAdminOrReadOnlyForSupport,)


class SupportRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = SupportRecordSerializer
    permission_classes = (IsSupportOrAdmin,)

    def get_queryset(self):
        user = self.request.user
        queryset = SupportRecord.objects.select_related(
            'support_person', 'room', 'maintenance_type'
        )
        if user.is_admin_role:
            return queryset.all()
        if user.is_support:
            return queryset.filter(support_person=user)
        return SupportRecord.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if request.user.is_admin_role and 'support_person' not in request.data:
            return Response(
                {'detail': 'Admins must specify a support_person when creating records.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record = serializer.save()
        return Response(
            SupportRecordSerializer(record, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class SupportRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSupportOrAdmin, IsSupportRecordOwnerOrAdmin)

    def get_queryset(self):
        user = self.request.user
        queryset = SupportRecord.objects.select_related(
            'support_person', 'room', 'maintenance_type'
        )
        if user.is_admin_role:
            return queryset.all()
        return queryset.filter(support_person=user)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return SupportRecordUpdateSerializer
        return SupportRecordSerializer

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        if not request.user.is_admin_role:
            return Response(
                {'detail': 'Only administrators can delete support records.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyRecordsView(generics.ListAPIView):
    serializer_class = SupportRecordSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if not user.is_support:
            raise PermissionDenied('Only support staff can view their own records.')
        return SupportRecord.objects.select_related(
            'support_person', 'room', 'maintenance_type'
        ).filter(support_person=user)
