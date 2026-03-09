from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    """Allow access only to users with ADMIN role."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_admin_role
        )


class IsAdminOrReadOnly(BasePermission):
    """Allow read access to any authenticated user; write access only to ADMIN."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin_role


class IsStudentOrAdmin(BasePermission):
    """Allow access to students (for their own data) and admins."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_student or request.user.is_admin_role)
        )


class IsEnrollmentOwnerOrAdmin(BasePermission):
    """Enrollment owner or admin can access enrollment details."""

    def has_object_permission(self, request, view, obj):
        return (
            obj.student == request.user or
            request.user.is_admin_role
        )
