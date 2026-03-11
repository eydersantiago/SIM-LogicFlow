from django.contrib import admin

from .models import Course, CourseSession, Room, Simulator


@admin.register(Simulator)
class SimulatorAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'is_active')
    list_filter = ('brand', 'is_active')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'simulator', 'room_type',
        'student_capacity', 'instructor_capacity', 'pseudopilot_capacity',
        'is_active',
    )
    list_filter = ('room_type', 'is_active', 'simulator')
    search_fields = ('name', 'simulator__name')
    ordering = ('simulator', 'name')
    raw_id_fields = ('simulator',)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'course_type', 'min_simulation_hours', 'is_active', 'created_at', 'updated_at')
    list_filter = ('course_type', 'is_active')
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(CourseSession)
class CourseSessionAdmin(admin.ModelAdmin):
    list_display = (
        'course', 'coordinator', 'main_room', 'pseudopilot_room',
        'start_date', 'end_date', 'schedule_time',
        'daily_simulation_hours', 'is_active',
    )
    list_filter = ('is_active', 'course', 'main_room__simulator')
    search_fields = ('course__name', 'main_room__name', 'coordinator__username')
    ordering = ('start_date', 'schedule_time')
    raw_id_fields = ('course', 'coordinator', 'main_room', 'pseudopilot_room')
    filter_horizontal = ('students', 'instructors', 'pseudopilots')
