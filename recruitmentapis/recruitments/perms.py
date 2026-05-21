from rest_framework import permissions

class IsEmployer(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return request.user.role == 'employer'
        return False


class IsApprovedEmployer(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if request.user.is_staff or request.user.is_superuser or request.user.role == 'admin':
            return True

        if request.user.role != 'employer':
            return False
        try:
            return request.user.company.is_approved and request.user.company.active
        except:
            return False


class IsAdmin(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return request.user.is_staff or request.user.is_superuser
        return False

class IsCandidate(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return request.user.role == 'candidate'
        return False

class IsCompanyOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        return obj.user == request.user


class IsJobOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and (request.user.is_staff or request.user.is_superuser):
            return True
        return obj.employer.user == request.user