from rest_framework import serializers

from courses.models import CourseSession
from courses.serializers import RoomSerializer
from users.models import User
from .models import MaintenanceType, SupportRecord


class MaintenanceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceType
        fields = ('id', 'name', 'description', 'is_active')
        read_only_fields = ('id',)

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Maintenance type name cannot be blank.')
        return value.strip()


class SupportRecordSerializer(serializers.ModelSerializer):
    support_person = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.TECHNICAL_COORDINATOR),
        required=False,
    )
    support_person_username = serializers.CharField(
        source='support_person.username', read_only=True
    )
    room_detail = RoomSerializer(source='room', read_only=True)
    maintenance_type_name = serializers.CharField(
        source='maintenance_type.name', read_only=True
    )

    class Meta:
        model = SupportRecord
        fields = (
            'id', 'support_person', 'support_person_username',
            'room', 'room_detail',
            'maintenance_type', 'maintenance_type_name',
            'scheduled_date', 'completed_date', 'status',
            'notes', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            user = request.user
            if not user.is_technical_coordinator and not user.is_admin_role:
                raise serializers.ValidationError(
                    'Only coordinators or administrators can create support records.'
                )
            if user.is_technical_coordinator:
                attrs['support_person'] = user
            elif user.is_admin_role and 'support_person' not in attrs:
                raise serializers.ValidationError(
                    {'support_person': 'This field is required for admin users.'}
                )

        scheduled_date = attrs.get('scheduled_date')
        completed_date = attrs.get('completed_date')
        if scheduled_date and completed_date and completed_date < scheduled_date:
            raise serializers.ValidationError(
                {'completed_date': 'Completed date cannot be before the scheduled date.'}
            )

        status_val = attrs.get('status', SupportRecord.Status.PENDING)
        if status_val == SupportRecord.Status.COMPLETED and not completed_date:
            raise serializers.ValidationError(
                {'completed_date': 'A completed date is required when status is COMPLETED.'}
            )

        room = attrs.get('room')
        if room and scheduled_date and status_val in [SupportRecord.Status.PENDING, SupportRecord.Status.IN_PROGRESS]:
            # Check conflict with main_room or pseudopilot_room in active sessions
            conflicting_main = CourseSession.objects.filter(
                main_room=room,
                is_active=True,
                start_date__lte=scheduled_date,
                end_date__gte=scheduled_date,
            )
            conflicting_pseudo = CourseSession.objects.filter(
                pseudopilot_room=room,
                is_active=True,
                start_date__lte=scheduled_date,
                end_date__gte=scheduled_date,
            )
            conflict = conflicting_main.first() or conflicting_pseudo.first()
            if conflict:
                raise serializers.ValidationError({
                    'room': (
                        f'La sala "{room.name}" tiene una sesión de curso activa '
                        f'("{conflict.course.name}", del {conflict.start_date} al {conflict.end_date}). '
                        f'No se puede programar mantenimiento durante ese período.'
                    )
                })

        return attrs


class SupportRecordUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportRecord
        fields = (
            'id', 'room', 'maintenance_type', 'scheduled_date',
            'completed_date', 'status', 'notes', 'updated_at',
        )
        read_only_fields = ('id', 'updated_at')

    def validate(self, attrs):
        scheduled_date = attrs.get(
            'scheduled_date',
            self.instance.scheduled_date if self.instance else None
        )
        completed_date = attrs.get(
            'completed_date',
            self.instance.completed_date if self.instance else None
        )
        if scheduled_date and completed_date and completed_date < scheduled_date:
            raise serializers.ValidationError(
                {'completed_date': 'Completed date cannot be before the scheduled date.'}
            )

        status_val = attrs.get(
            'status',
            self.instance.status if self.instance else SupportRecord.Status.PENDING
        )
        if status_val == SupportRecord.Status.COMPLETED and not completed_date:
            raise serializers.ValidationError(
                {'completed_date': 'A completed date is required when status is COMPLETED.'}
            )

        room = attrs.get('room', self.instance.room if self.instance else None)
        if room and scheduled_date and status_val in [SupportRecord.Status.PENDING, SupportRecord.Status.IN_PROGRESS]:
            conflicting_main = CourseSession.objects.filter(
                main_room=room,
                is_active=True,
                start_date__lte=scheduled_date,
                end_date__gte=scheduled_date,
            )
            conflicting_pseudo = CourseSession.objects.filter(
                pseudopilot_room=room,
                is_active=True,
                start_date__lte=scheduled_date,
                end_date__gte=scheduled_date,
            )
            conflict = conflicting_main.first() or conflicting_pseudo.first()
            if conflict:
                raise serializers.ValidationError({
                    'room': (
                        f'La sala "{room.name}" tiene una sesión de curso activa '
                        f'("{conflict.course.name}", del {conflict.start_date} al {conflict.end_date}). '
                        f'No se puede programar mantenimiento durante ese período.'
                    )
                })

        return attrs
