from django.contrib import admin

from .models import Course, CourseSession, Enrollment, Room


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration_hours', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity', 'location', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'location')
    ordering = ('name',)


@admin.register(CourseSession)
class CourseSessionAdmin(admin.ModelAdmin):
    list_display = (
        'course', 'room', 'instructor_name',
        'start_date', 'end_date', 'schedule_time',
        'max_capacity', 'is_active',
    )
    list_filter = ('is_active', 'course', 'room')
    search_fields = ('course__name', 'room__name', 'instructor_name')
    ordering = ('start_date', 'schedule_time')
    raw_id_fields = ('course', 'room')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course_session', 'status', 'enrolled_at')
    list_filter = ('status', 'course_session__course')
    search_fields = ('student__username', 'student__email', 'course_session__course__name')
    ordering = ('-enrolled_at',)
    raw_id_fields = ('student', 'course_session')
