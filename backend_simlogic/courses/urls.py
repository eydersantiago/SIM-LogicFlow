from django.urls import path

from .views import (
    CourseDetailView,
    CourseListCreateView,
    CourseSessionDetailView,
    CourseSessionListCreateView,
    EnrollmentDetailView,
    EnrollmentListCreateView,
    MyEnrollmentsView,
    RoomDetailView,
    RoomListCreateView,
)

urlpatterns = [
    path('', CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('rooms/', RoomListCreateView.as_view(), name='room-list-create'),
    path('rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),
    path('sessions/', CourseSessionListCreateView.as_view(), name='session-list-create'),
    path('sessions/<int:pk>/', CourseSessionDetailView.as_view(), name='session-detail'),
    path('enrollments/', EnrollmentListCreateView.as_view(), name='enrollment-list-create'),
    path('enrollments/<int:pk>/', EnrollmentDetailView.as_view(), name='enrollment-detail'),
    path('my-enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
]
