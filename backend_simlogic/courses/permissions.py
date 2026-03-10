from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin_role


class IsCoordinatorOrAdmin(BasePermission):
    """Allow access to academic coordinators and admins."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.is_academic_coordinator or request.user.is_admin_role)
        )


class IsCoordinatorOrAdminOrReadOnly(BasePermission):
    """Write access only for ACADEMIC_COORDINATOR or ADMIN."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_academic_coordinator or request.user.is_admin_role
