from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsTechnicalCoordinatorOrAdmin(BasePermission):
    """Allow access to technical coordinators and admins."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.is_technical_coordinator or request.user.is_admin_role)
        )


class IsSupportRecordOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.support_person == request.user or request.user.is_admin_role


class IsAdminOrReadOnlyForSupport(BasePermission):
    """Read: technical coordinator or admin. Write: admin only."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not (request.user.is_technical_coordinator or request.user.is_admin_role):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin_role
