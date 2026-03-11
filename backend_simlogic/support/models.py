from django.conf import settings
from django.db import models

from courses.models import Room


class MaintenanceType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Maintenance Type'
        verbose_name_plural = 'Maintenance Types'
        ordering = ['name']

    def __str__(self):
        return self.name


class SupportRecord(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    support_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_records',
        limit_choices_to={'role': 'TECHNICAL_COORDINATOR'},
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='support_records',
    )
    maintenance_type = models.ForeignKey(
        MaintenanceType,
        on_delete=models.CASCADE,
        related_name='support_records',
    )
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Support Record'
        verbose_name_plural = 'Support Records'
        ordering = ['-scheduled_date', '-created_at']

    def __str__(self):
        return (
            f'{self.maintenance_type.name} - {self.room.name} '
            f'({self.scheduled_date}) [{self.get_status_display()}]'
        )
