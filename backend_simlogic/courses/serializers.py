from rest_framework import serializers

from users.serializers import UserProfileSerializer
from .models import Course, CourseSession, Enrollment, Room
from support.models import SupportRecord


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            'id', 'name', 'description', 'duration_hours',
            'created_at', 'updated_at', 'is_active',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_duration_hours(self, value):
        if value <= 0:
            raise serializers.ValidationError('Duration must be a positive number of hours.')
        return value


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'name', 'capacity', 'location', 'description', 'is_active')
        read_only_fields = ('id',)

    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Capacity must be a positive integer.')
        return value


class CourseSessionSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = CourseSession
        fields = (
            'id', 'course', 'course_name', 'room', 'room_name',
            'instructor_name', 'start_date', 'end_date', 'schedule_time',
            'max_capacity', 'is_active', 'enrolled_count', 'available_spots', 'is_full',
        )
        read_only_fields = ('id',)

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'End date must be after start date.'})

        room = attrs.get('room')
        max_capacity = attrs.get('max_capacity')
        if room and max_capacity and max_capacity > room.capacity:
            raise serializers.ValidationError(
                {'max_capacity': f'Max capacity cannot exceed room capacity of {room.capacity}.'}
            )

        if room and start_date and end_date:
            conflicting = SupportRecord.objects.filter(
                room=room,
                status__in=[SupportRecord.Status.PENDING, SupportRecord.Status.IN_PROGRESS],
                scheduled_date__range=(start_date, end_date),
            )
            if conflicting.exists():
                conflict = conflicting.first()
                raise serializers.ValidationError({
                    'room': (
                        f'La sala "{room.name}" tiene mantenimiento programado el {conflict.scheduled_date} '
                        f'(estado: {conflict.get_status_display()}). No se puede asignar una sesión durante ese período.'
                    )
                })

        return attrs


class EnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    course_session_detail = CourseSessionSerializer(source='course_session', read_only=True)

    class Meta:
        model = Enrollment
        fields = (
            'id', 'student', 'student_username', 'course_session',
            'course_session_detail', 'enrolled_at', 'status',
        )
        read_only_fields = ('id', 'enrolled_at', 'student')

    def validate(self, attrs):
        request = self.context.get('request')
        course_session = attrs.get('course_session')

        if request and hasattr(request, 'user'):
            student = request.user

            if not student.is_student:
                raise serializers.ValidationError('Only students can enroll in course sessions.')

            existing = Enrollment.objects.filter(
                student=student,
                course_session=course_session,
            ).first()
            if existing:
                if existing.status == Enrollment.Status.ACTIVE:
                    raise serializers.ValidationError('You are already enrolled in this session.')
                elif existing.status == Enrollment.Status.CANCELLED:
                    raise serializers.ValidationError(
                        'Your previous enrollment was cancelled. Please contact an administrator.'
                    )

        if course_session and not course_session.is_active:
            raise serializers.ValidationError({'course_session': 'This course session is not active.'})

        if course_session and course_session.is_full:
            raise serializers.ValidationError(
                {'course_session': 'This course session is full. No spots available.'}
            )

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['student'] = request.user
        return super().create(validated_data)


class EnrollmentStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ('id', 'status', 'enrolled_at')
        read_only_fields = ('id', 'enrolled_at')
