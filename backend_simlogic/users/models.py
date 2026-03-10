from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Estudiante'
        ACADEMIC_COORDINATOR = 'ACADEMIC_COORDINATOR', 'Coordinador Académico'
        TECHNICAL_COORDINATOR = 'TECHNICAL_COORDINATOR', 'Coordinador Técnico'
        INSTRUCTOR = 'INSTRUCTOR', 'Instructor'
        PSEUDOPILOT = 'PSEUDOPILOT', 'Pseudopiloto'
        ADMIN = 'ADMIN', 'Administrador'

    role = models.CharField(
        max_length=22,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_academic_coordinator(self):
        return self.role == self.Role.ACADEMIC_COORDINATOR

    @property
    def is_technical_coordinator(self):
        return self.role == self.Role.TECHNICAL_COORDINATOR

    @property
    def is_coordinator(self):
        """True for either coordinator role."""
        return self.role in (self.Role.ACADEMIC_COORDINATOR, self.Role.TECHNICAL_COORDINATOR)

    @property
    def is_instructor(self):
        return self.role == self.Role.INSTRUCTOR

    @property
    def is_pseudopilot(self):
        return self.role == self.Role.PSEUDOPILOT

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN
