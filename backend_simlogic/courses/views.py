from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, CourseSession, Enrollment, Room
from .permissions import (
    IsAdminOrReadOnly,
    IsEnrollmentOwnerOrAdmin,
    IsStudentOrAdmin,
)
from .serializers import (
    CourseSerializer,
    CourseSessionSerializer,
    EnrollmentSerializer,
    EnrollmentStatusUpdateSerializer,
    RoomSerializer,
)


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = Course.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = (IsAdminOrReadOnly,)


class RoomListCreateView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = Room.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = (IsAdminOrReadOnly,)


class CourseSessionListCreateView(generics.ListCreateAPIView):
    queryset = CourseSession.objects.select_related('course', 'room').all()
    serializer_class = CourseSessionSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = CourseSession.objects.select_related('course', 'room').all()
        course_id = self.request.query_params.get('course')
        room_id = self.request.query_params.get('room')
        is_active = self.request.query_params.get('is_active')

        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


class CourseSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseSession.objects.select_related('course', 'room').all()
    serializer_class = CourseSessionSerializer
    permission_classes = (IsAdminOrReadOnly,)


class EnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            return Enrollment.objects.select_related(
                'student', 'course_session__course', 'course_session__room'
            ).all()
        if user.is_student:
            return Enrollment.objects.select_related(
                'student', 'course_session__course', 'course_session__room'
            ).filter(student=user)
        return Enrollment.objects.none()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsStudentOrAdmin()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = serializer.save()
        return Response(
            EnrollmentSerializer(enrollment, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class EnrollmentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = (IsAuthenticated, IsEnrollmentOwnerOrAdmin)

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            return Enrollment.objects.select_related(
                'student', 'course_session__course', 'course_session__room'
            ).all()
        return Enrollment.objects.select_related(
            'student', 'course_session__course', 'course_session__room'
        ).filter(student=user)

    def destroy(self, request, *args, **kwargs):
        enrollment = self.get_object()
        if enrollment.status == Enrollment.Status.CANCELLED:
            return Response(
                {'detail': 'This enrollment is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        enrollment.status = Enrollment.Status.CANCELLED
        enrollment.save()
        return Response(
            {'detail': 'Enrollment cancelled successfully.'},
            status=status.HTTP_200_OK,
        )


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if not user.is_student:
            raise PermissionDenied('Only students can view their enrollments.')
        return Enrollment.objects.select_related(
            'student', 'course_session__course', 'course_session__room'
        ).filter(student=user)
