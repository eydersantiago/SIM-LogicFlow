from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        SUPPORT = 'SUPPORT', 'Support Staff'
        ADMIN = 'ADMIN', 'Administrator'

    role = models.CharField(
        max_length=10,
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
    def is_support(self):
        return self.role == self.Role.SUPPORT

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN
