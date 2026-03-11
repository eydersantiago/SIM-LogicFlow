from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, CourseSession, Room, Simulator
from .permissions import (
    IsAdminOrReadOnly,
    IsCoordinatorOrAdmin,
    IsCoordinatorOrAdminOrReadOnly,
)
from .serializers import (
    CourseSerializer,
    CourseSessionSerializer,
    RoomSerializer,
    SimulatorSerializer,
)


class SimulatorListCreateView(generics.ListCreateAPIView):
    queryset = Simulator.objects.all()
    serializer_class = SimulatorSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = Simulator.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


class SimulatorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Simulator.objects.all()
    serializer_class = SimulatorSerializer
    permission_classes = (IsAdminOrReadOnly,)


class RoomListCreateView(generics.ListCreateAPIView):
    serializer_class = RoomSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = Room.objects.select_related('simulator').all()
        is_active = self.request.query_params.get('is_active')
        simulator_id = self.request.query_params.get('simulator')
        room_type = self.request.query_params.get('room_type')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if simulator_id:
            queryset = queryset.filter(simulator_id=simulator_id)
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        return queryset


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.select_related('simulator').all()
    serializer_class = RoomSerializer
    permission_classes = (IsAdminOrReadOnly,)


class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = (IsCoordinatorOrAdminOrReadOnly,)

    def get_queryset(self):
        queryset = Course.objects.all()
        is_active = self.request.query_params.get('is_active')
        course_type = self.request.query_params.get('course_type')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if course_type:
            queryset = queryset.filter(course_type=course_type)
        return queryset


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = (IsCoordinatorOrAdminOrReadOnly,)


class CourseSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSessionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = CourseSession.objects.select_related(
            'course', 'coordinator', 'main_room', 'pseudopilot_room',
            'main_room__simulator', 'pseudopilot_room__simulator',
        ).prefetch_related('students', 'instructors', 'pseudopilots').all()

        course_id = self.request.query_params.get('course')
        is_active = self.request.query_params.get('is_active')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsCoordinatorOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(coordinator=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSessionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return CourseSession.objects.select_related(
            'course', 'coordinator', 'main_room', 'pseudopilot_room',
            'main_room__simulator', 'pseudopilot_room__simulator',
        ).prefetch_related('students', 'instructors', 'pseudopilots').all()

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsCoordinatorOrAdmin()]
        return [IsAuthenticated()]


class MyScheduleView(generics.ListAPIView):
    serializer_class = CourseSessionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.is_coordinator or user.is_admin_role:
            raise PermissionDenied(
                'Los coordinadores y administradores no tienen horario personal. '
                'Use el endpoint de listado de sesiones.'
            )

        base_qs = CourseSession.objects.select_related(
            'course', 'coordinator', 'main_room', 'pseudopilot_room',
            'main_room__simulator', 'pseudopilot_room__simulator',
        ).prefetch_related('students', 'instructors', 'pseudopilots')

        if user.is_student:
            return base_qs.filter(students=user)
        if user.is_instructor:
            return base_qs.filter(instructors=user)
        if user.is_pseudopilot:
            return base_qs.filter(pseudopilots=user)

        raise PermissionDenied('Your role does not have an associated schedule.')
