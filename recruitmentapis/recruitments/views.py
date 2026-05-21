from rest_framework import viewsets, generics, parsers, status, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from recruitments.models import User, Company, Application, SavedJob
from recruitments import serializers


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get','patch'], detail=False, url_path='current-user', permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            s = serializers.SimpleUserSerializer(u, data=request.data)
            s.is_valid(raise_exception=True)
            u = s.save()
        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

class CompanyViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = Company.objects.filter(is_approved=True, active=True)
    serializer_class = serializers.CompanySerializer
    parser_classes = [parsers.MultiPartParser]  # vì có upload logo

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        if Company.objects.filter(user=self.request.user).exists():
            raise ValidationError(
                {"detail": "Tài khoản này đã có hồ sơ công ty."}
            )
        serializer.save(user=self.request.user)

class ApplicationViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    serializer_class = serializers.ApplicationSerializer
    parser_classes = [parsers.MultiPartParser]  # upload cv_file lên Cloudinary
    permission_classes = [permissions.IsAuthenticated]

    # def get_serializer_class(self):
    #     if self.action == 'review':
    #         return serializers.ApplicationReviewSerializer
    #     return serializers.ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role.__eq__('candidate'):
            # Candidate chỉ thấy đơn mình đã nộp
            return Application.objects.filter(candidate=user, active=True)
        elif user.role.__eq__('employer'):
            # Employer thấy CV nộp vào job của công ty mình
            return Application.objects.filter(job__employer__user=user, active=True)
        return Application.objects.none() # xem ở bên view hay seri

    def perform_create(self, serializer):
        user = self.request.user
        if not user.role.__eq__('candidate'):
            raise PermissionDenied("Chỉ ứng viên mới được nộp đơn.")
        serializer.save(candidate=user)
        # unique_together ('candidate', 'job') tự raise lỗi nếu nộp trùng

    @action(methods=['patch'], detail=True, url_path='review',
            permission_classes=[permissions.IsAuthenticated])
    def review(self, request, pk=None):
        #PATCH /api/applications/{id}/review/ — Employer đánh giá hồ sơ
        if not request.user.role.__eq__('employer'):
            raise PermissionDenied("Chỉ nhà tuyển dụng mới được đánh giá hồ sơ.")

        #application = generics.get_object_or_404(Application, pk=pk, active=True)
        application = self.get_object().filter(pk=pk, active=True)
        # Kiểm tra application này có thuộc công ty của employer không
        #Thử ghi đè lại lớp permission_class để xét quyền
        if application.job.employer.user != request.user:
            raise PermissionDenied("Bạn không có quyền đánh giá đơn này.")

        s = serializers.ApplicationReviewSerializer(application, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(serializers.ApplicationSerializer(application).data, status=status.HTTP_200_OK)

class SavedJobViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    serializer_class = serializers.SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user, active=True)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.role.__eq__('candidate'):
            raise PermissionDenied("Chỉ ứng viên mới được lưu việc làm.")
        serializer.save(user=user)

    @action(methods=['delete'], detail=True, url_path='unsave')
    def unsave(self, request, pk=None):
        #DELETE /api/saved-jobs/{id}/unsave/ — Bỏ lưu việc làm
        saved = generics.get_object_or_404(
            SavedJob, pk=pk, user=request.user, active=True
        )
        saved.active = False
        saved.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


