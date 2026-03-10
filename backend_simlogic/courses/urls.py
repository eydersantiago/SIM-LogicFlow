from django.urls import path

from .views import (
    CourseDetailView,
    CourseListCreateView,
    CourseSessionDetailView,
    CourseSessionListCreateView,
    MyScheduleView,
    RoomDetailView,
    RoomListCreateView,
    SimulatorDetailView,
    SimulatorListCreateView,
)

urlpatterns = [
    path('', CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('simulators/', SimulatorListCreateView.as_view(), name='simulator-list-create'),
    path('simulators/<int:pk>/', SimulatorDetailView.as_view(), name='simulator-detail'),
    path('rooms/', RoomListCreateView.as_view(), name='room-list-create'),
    path('rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),
    path('sessions/', CourseSessionListCreateView.as_view(), name='session-list-create'),
    path('sessions/<int:pk>/', CourseSessionDetailView.as_view(), name='session-detail'),
    path('my-schedule/', MyScheduleView.as_view(), name='my-schedule'),
]
