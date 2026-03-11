from django.conf import settings
from django.db import models


class Simulator(models.Model):
    class Brand(models.TextChoices):
        INDRA = 'INDRA', 'Indra'
        THALES = 'THALES', 'Thales'

    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=10, choices=Brand.choices)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Simulator'
        verbose_name_plural = 'Simulators'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.get_brand_display()})'


class Room(models.Model):
    class RoomType(models.TextChoices):
        RADAR = 'RADAR', 'Radar'
        AERODROME = 'AERODROME', 'Aeródromo'
        PSEUDOPILOT = 'PSEUDOPILOT', 'Pseudopilotos'

    simulator = models.ForeignKey(Simulator, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=20, choices=RoomType.choices)
    student_capacity = models.PositiveIntegerField(default=0)
    instructor_capacity = models.PositiveIntegerField(default=0)
    pseudopilot_capacity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        ordering = ['name']
        unique_together = ('simulator', 'room_type')

    def __str__(self):
        return f'{self.name} ({self.get_room_type_display()}) - {self.simulator.name}'


class Course(models.Model):
    class CourseType(models.TextChoices):
        RADAR = 'RADAR', 'Radar'
        AERODROME = 'AERODROME', 'Aeródromo'

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course_type = models.CharField(max_length=20, choices=CourseType.choices)
    min_simulation_hours = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.get_course_type_display()})'

    @property
    def max_students(self):
        return 10 if self.course_type == self.CourseType.RADAR else 8

    @property
    def max_instructors(self):
        return 5 if self.course_type == self.CourseType.RADAR else 2

    @property
    def max_pseudopilots(self):
        return 5 if self.course_type == self.CourseType.RADAR else 2


class CourseSession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    coordinator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coordinated_sessions',
        limit_choices_to={'role': 'ACADEMIC_COORDINATOR'},
    )
    main_room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='main_sessions',
    )
    pseudopilot_room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='pseudopilot_sessions',
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='student_sessions',
        limit_choices_to={'role': 'STUDENT'},
        blank=True,
    )
    instructors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='instructor_sessions',
        limit_choices_to={'role': 'INSTRUCTOR'},
    )
    pseudopilots = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='pseudopilot_sessions',
        limit_choices_to={'role': 'PSEUDOPILOT'},
    )
    start_date = models.DateField()
    end_date = models.DateField()
    schedule_time = models.TimeField()
    daily_simulation_hours = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Course Session'
        verbose_name_plural = 'Course Sessions'
        ordering = ['start_date', 'schedule_time']

    def __str__(self):
        return (
            f'{self.course.name} - {self.start_date} '
            f'({self.main_room.name})'
        )
