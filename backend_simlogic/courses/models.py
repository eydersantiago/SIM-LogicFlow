from django.conf import settings
from django.db import models


class Course(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_hours = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['name']

    def __str__(self):
        return self.name


class Room(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField()
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} (capacity: {self.capacity})'


class CourseSession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='sessions')
    instructor_name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    schedule_time = models.TimeField()
    max_capacity = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Course Session'
        verbose_name_plural = 'Course Sessions'
        ordering = ['start_date', 'schedule_time']

    def __str__(self):
        return f'{self.course.name} - {self.start_date} ({self.room.name})'

    @property
    def enrolled_count(self):
        return self.enrollments.filter(status=Enrollment.Status.ACTIVE).count()

    @property
    def available_spots(self):
        return self.max_capacity - self.enrolled_count

    @property
    def is_full(self):
        return self.available_spots <= 0


class Enrollment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'STUDENT'},
    )
    course_session = models.ForeignKey(
        CourseSession,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    class Meta:
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        unique_together = ('student', 'course_session')
        ordering = ['-enrolled_at']

    def __str__(self):
        return f'{self.student.username} -> {self.course_session}'
