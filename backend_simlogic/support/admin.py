from django.contrib import admin

from .models import MaintenanceType, SupportRecord


@admin.register(MaintenanceType)
class MaintenanceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(SupportRecord)
class SupportRecordAdmin(admin.ModelAdmin):
    list_display = (
        'support_person', 'room', 'maintenance_type',
        'scheduled_date', 'completed_date', 'status', 'created_at',
    )
    list_filter = ('status', 'maintenance_type', 'room')
    search_fields = (
        'support_person__username', 'room__name',
        'maintenance_type__name', 'notes',
    )
    ordering = ('-scheduled_date', '-created_at')
    raw_id_fields = ('support_person', 'room', 'maintenance_type')
    date_hierarchy = 'scheduled_date'
