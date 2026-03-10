from rest_framework import serializers

from users.models import User
from .models import Course, CourseSession, Room, Simulator


class SimulatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Simulator
        fields = ('id', 'name', 'brand', 'is_active')
        read_only_fields = ('id',)


class RoomSerializer(serializers.ModelSerializer):
    simulator_name = serializers.CharField(source='simulator.name', read_only=True)

    class Meta:
        model = Room
        fields = (
            'id', 'simulator', 'simulator_name', 'name', 'room_type',
            'student_capacity', 'instructor_capacity', 'pseudopilot_capacity',
            'is_active',
        )
        read_only_fields = ('id',)


class CourseSerializer(serializers.ModelSerializer):
    max_students = serializers.IntegerField(read_only=True)
    max_instructors = serializers.IntegerField(read_only=True)
    max_pseudopilots = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = (
            'id', 'name', 'description', 'course_type', 'min_simulation_hours',
            'is_active', 'created_at', 'updated_at',
            'max_students', 'max_instructors', 'max_pseudopilots',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_min_simulation_hours(self, value):
        if value <= 0:
            raise serializers.ValidationError('min_simulation_hours must be a positive integer.')
        return value


class UserBriefSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'full_name', 'email', 'role')
        read_only_fields = fields

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip() or obj.username


class CourseSessionSerializer(serializers.ModelSerializer):
    # Write fields (ids)
    students = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role='STUDENT'),
        required=False,
    )
    instructors = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role='INSTRUCTOR'),
    )
    pseudopilots = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role='PSEUDOPILOT'),
    )

    # Read-only nested details
    course_detail = CourseSerializer(source='course', read_only=True)
    main_room_detail = RoomSerializer(source='main_room', read_only=True)
    pseudopilot_room_detail = RoomSerializer(source='pseudopilot_room', read_only=True)
    coordinator_detail = UserBriefSerializer(source='coordinator', read_only=True)
    students_detail = UserBriefSerializer(source='students', many=True, read_only=True)
    instructors_detail = UserBriefSerializer(source='instructors', many=True, read_only=True)
    pseudopilots_detail = UserBriefSerializer(source='pseudopilots', many=True, read_only=True)

    class Meta:
        model = CourseSession
        fields = (
            'id',
            'course', 'course_detail',
            'coordinator', 'coordinator_detail',
            'main_room', 'main_room_detail',
            'pseudopilot_room', 'pseudopilot_room_detail',
            'students', 'students_detail',
            'instructors', 'instructors_detail',
            'pseudopilots', 'pseudopilots_detail',
            'start_date', 'end_date', 'schedule_time',
            'daily_simulation_hours', 'is_active',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'coordinator', 'created_at', 'updated_at')

    def validate(self, attrs):
        # Resolve values, falling back to instance on partial update
        instance = self.instance

        course = attrs.get('course', getattr(instance, 'course', None))
        main_room = attrs.get('main_room', getattr(instance, 'main_room', None))
        pseudopilot_room = attrs.get('pseudopilot_room', getattr(instance, 'pseudopilot_room', None))
        start_date = attrs.get('start_date', getattr(instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(instance, 'end_date', None))
        daily_simulation_hours = attrs.get(
            'daily_simulation_hours',
            getattr(instance, 'daily_simulation_hours', None),
        )
        students = attrs.get('students', list(instance.students.all()) if instance else [])
        instructors = attrs.get('instructors', list(instance.instructors.all()) if instance else [])
        pseudopilots = attrs.get('pseudopilots', list(instance.pseudopilots.all()) if instance else [])

        # 1. end_date >= start_date
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {'end_date': 'end_date must be greater than or equal to start_date.'}
            )

        # 2. daily_simulation_hours <= 6
        if daily_simulation_hours is not None and daily_simulation_hours > 6:
            raise serializers.ValidationError(
                {'daily_simulation_hours': 'daily_simulation_hours cannot exceed 6.'}
            )

        if course and main_room:
            # 3. main_room.room_type must match course.course_type
            if main_room.room_type != course.course_type:
                raise serializers.ValidationError(
                    {
                        'main_room': (
                            f'The main room type "{main_room.room_type}" does not match '
                            f'the course type "{course.course_type}". '
                            f'A {course.course_type} course requires a {course.course_type} room.'
                        )
                    }
                )

        if pseudopilot_room:
            # 4. pseudopilot_room.room_type == 'PSEUDOPILOT'
            if pseudopilot_room.room_type != Room.RoomType.PSEUDOPILOT:
                raise serializers.ValidationError(
                    {'pseudopilot_room': 'The pseudopilot_room must have room_type PSEUDOPILOT.'}
                )

        if main_room and pseudopilot_room:
            # 5. Both rooms must belong to the same simulator
            if main_room.simulator_id != pseudopilot_room.simulator_id:
                raise serializers.ValidationError(
                    {
                        'pseudopilot_room': (
                            'main_room and pseudopilot_room must belong to the same simulator.'
                        )
                    }
                )

        if course:
            # 6. students count
            if len(students) < 1:
                raise serializers.ValidationError(
                    {'students': 'At least 1 student is required.'}
                )
            if len(students) > course.max_students:
                raise serializers.ValidationError(
                    {'students': f'Cannot exceed {course.max_students} students for this course type.'}
                )

            # 7. instructors count
            if len(instructors) < 1:
                raise serializers.ValidationError(
                    {'instructors': 'At least 1 instructor is required.'}
                )
            if len(instructors) > course.max_instructors:
                raise serializers.ValidationError(
                    {'instructors': f'Cannot exceed {course.max_instructors} instructors for this course type.'}
                )

            # 8. pseudopilots count
            if len(pseudopilots) < 1:
                raise serializers.ValidationError(
                    {'pseudopilots': 'At least 1 pseudopilot is required.'}
                )
            if len(pseudopilots) > course.max_pseudopilots:
                raise serializers.ValidationError(
                    {'pseudopilots': f'Cannot exceed {course.max_pseudopilots} pseudopilots for this course type.'}
                )

        if main_room:
            # 9. students <= main_room.student_capacity
            if len(students) > main_room.student_capacity:
                raise serializers.ValidationError(
                    {
                        'students': (
                            f'Number of students ({len(students)}) exceeds the main room '
                            f'student capacity ({main_room.student_capacity}).'
                        )
                    }
                )

            # 10. instructors <= main_room.instructor_capacity
            if len(instructors) > main_room.instructor_capacity:
                raise serializers.ValidationError(
                    {
                        'instructors': (
                            f'Number of instructors ({len(instructors)}) exceeds the main room '
                            f'instructor capacity ({main_room.instructor_capacity}).'
                        )
                    }
                )

        if pseudopilot_room:
            # 11. pseudopilots <= pseudopilot_room.pseudopilot_capacity
            if len(pseudopilots) > pseudopilot_room.pseudopilot_capacity:
                raise serializers.ValidationError(
                    {
                        'pseudopilots': (
                            f'Number of pseudopilots ({len(pseudopilots)}) exceeds the pseudopilot room '
                            f'capacity ({pseudopilot_room.pseudopilot_capacity}).'
                        )
                    }
                )

        # 12. Maintenance conflict check
        if main_room and start_date and end_date:
            from support.models import SupportRecord
            conflicting_main = SupportRecord.objects.filter(
                room=main_room,
                status__in=[SupportRecord.Status.PENDING, SupportRecord.Status.IN_PROGRESS],
                scheduled_date__range=(start_date, end_date),
            )
            if conflicting_main.exists():
                conflict = conflicting_main.first()
                raise serializers.ValidationError(
                    {
                        'main_room': (
                            f'La sala "{main_room.name}" tiene mantenimiento programado el '
                            f'{conflict.scheduled_date} (estado: {conflict.get_status_display()}). '
                            f'No se puede asignar una sesión durante ese período.'
                        )
                    }
                )

        if pseudopilot_room and start_date and end_date:
            from support.models import SupportRecord
            conflicting_pseudo = SupportRecord.objects.filter(
                room=pseudopilot_room,
                status__in=[SupportRecord.Status.PENDING, SupportRecord.Status.IN_PROGRESS],
                scheduled_date__range=(start_date, end_date),
            )
            if conflicting_pseudo.exists():
                conflict = conflicting_pseudo.first()
                raise serializers.ValidationError(
                    {
                        'pseudopilot_room': (
                            f'La sala "{pseudopilot_room.name}" tiene mantenimiento programado el '
                            f'{conflict.scheduled_date} (estado: {conflict.get_status_display()}). '
                            f'No se puede asignar una sesión durante ese período.'
                        )
                    }
                )

        # 13. Role validation for each M2M list
        for student in students:
            if student.role != 'STUDENT':
                raise serializers.ValidationError(
                    {'students': f'User "{student.username}" does not have the STUDENT role.'}
                )
        for instructor in instructors:
            if instructor.role != 'INSTRUCTOR':
                raise serializers.ValidationError(
                    {'instructors': f'User "{instructor.username}" does not have the INSTRUCTOR role.'}
                )
        for pseudopilot in pseudopilots:
            if pseudopilot.role != 'PSEUDOPILOT':
                raise serializers.ValidationError(
                    {'pseudopilots': f'User "{pseudopilot.username}" does not have the PSEUDOPILOT role.'}
                )

        return attrs
