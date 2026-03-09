from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSupportOrAdmin(BasePermission):
    """Allow access only to support staff or admins."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_support or request.user.is_admin_role)
        )


class IsSupportRecordOwnerOrAdmin(BasePermission):
    """Support record owner or admin can access support record details."""

    def has_object_permission(self, request, view, obj):
        return (
            obj.support_person == request.user or
            request.user.is_admin_role
        )


class IsAdminOrReadOnlyForSupport(BasePermission):
    """Allow read to support/admin, write only to admin."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not (request.user.is_support or request.user.is_admin_role):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin_role
