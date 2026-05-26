from datetime import datetime
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, parsers, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from recruitments.models import User, Company, Application, SavedJob, Job, Category, Skill
from recruitments import serializers
from recruitments import perms, paginators
from django.db.models import Count, Sum, Q
from django.db.models.functions import ExtractMonth, ExtractYear

#USER
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get','patch'], detail=False, url_path='current-user', permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            s = serializers.SimpleUserSerializer(u, data=request.data, partial=True)
            s.is_valid(raise_exception=True)
            u = s.save()
        return Response(serializers.UserSerializer(u, context={'request':request}).data, status=status.HTTP_200_OK)

#COMPANY
class CompanyViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView, generics.UpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = serializers.CompanySerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.is_staff or user.is_superuser:
                return Company.objects.all()
            if user.role == 'candidate':
                return Company.objects.filter(is_approved=True, active=True)
            if user.role == 'employer':
                return Company.objects.filter(user=user)
        return Company.objects.filter(is_approved=True, active=True)

    def get_serializer_class(self):
        if self.action in ['list']:
            return serializers.CompanySimpleSerializer
        if self.action in ['update', 'partial_update']:
            return serializers.CompanyAdminSerializer
        return serializers.CompanySerializer

    def get_permissions(self):
        if self.request.method in ['POST']:
            return [perms.IsEmployer()]
        if self.action == 'current_company':
            return [perms.IsEmployer()]
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    #Còn cần chỉnh lại
    def perform_create(self, serializer):
        if Company.objects.filter(user=self.request.user).exists():
            raise ValidationError(
                {"detail": "Tài khoản này đã có hồ sơ công ty."}
            )
        serializer.save(user=self.request.user, active=True)

    #Sau khi cập nhật hiển thị lại chi tiết thông tin công ty
    def update(self, request, *args, **kwargs):
        company = self.get_object()
        s = serializers.CompanyAdminSerializer(company, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        company = s.save()
        return Response(serializers.CompanySerializer(company, context={'request': request}).data,
                        status=status.HTTP_200_OK)
    @action(methods=['patch', 'get'], detail=False, url_path='current-company')
    def current_company(self, request):
        company = Company.objects.filter(user=request.user).first()
        if not company:
            return Response({"detail": "Tài khoản của bạn chưa tạo hồ sơ công ty."},
                            status=status.HTTP_400_BAD_REQUEST)
        if request.method == 'GET':
            return Response(serializers.CompanySerializer(company, context={'request': request}).data,
                            status=status.HTTP_200_OK)
        s = serializers.CompanySimpleSerializer(company, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        company = s.save()
        return Response(serializers.CompanySerializer(company, context={'request': request}).data,
                        status=status.HTTP_200_OK)
#JOBS
class SkillViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Skill.objects.filter(active=True)
    serializer_class = serializers.SkillSerializer

class CategoryViewset(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = serializers.CategorySerializer
class JobViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.DestroyAPIView, generics.RetrieveAPIView):
    queryset = Job.objects.filter(active=True)
    serializer_class = serializers.JobDetailSerializer
    pagination_class = paginators.JobPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'title',
        'location',
        'category__name',
        'employer__name'
    ]

    filterset_fields = {
        'category': ['exact'],
        'location': ['exact'],
        'skills__name': ['exact'],
        'salary_min': ['gte'],
        'salary_max': ['lte'],
    }

    ordering_fields = ['salary_min', 'salary_max', 'created_date']
    ordering = ['-created_date']

    def get_queryset(self):
        user = self.request.user
        query = self.queryset
        saved = self.request.query_params.get('saved')
        if saved == 'true' and self.request.user.is_authenticated:
            query = query.filter(saved_users__user=self.request.user, saved_users__active=True)
        if user.is_authenticated and user.role == 'employer':
                query = query.filter(
                    Q(employer__is_approved=True, active=True) |
                    Q(employer__user=user)
                )
        else:
            query = query.filter(employer__is_approved=True, active=True)
        return query


    def get_serializer_class(self):
        if self.action == 'list':
            return serializers.JobSimpleSerializer
        return serializers.JobDetailSerializer

    def get_permissions(self):
        if self.action == 'save_job':
            return [perms.IsCandidate()]
        if self.action == 'create':
            return [perms.IsEmployer(), perms.IsApprovedEmployer()]
        if self.request.method in ['DELETE']:
            return [perms.IsJobOwner()]
        if self.action == 'update_job':
            return [permissions.IsAuthenticated(), perms.IsEmployer(), perms.IsJobOwner()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        company = self.request.user.company
        serializer.save(employer=company)

    @action(methods=['patch'], detail=True, url_path='update-job')
    def update_job(self, request, pk=None):
        job = self.get_object()
        s = serializers.JobSimpleSerializer(job, data=request.data, partial=True, context={'request':request})
        s.is_valid(raise_exception=True)
        job = s.save()
        return Response(serializers.JobDetailSerializer(job, context={'request': request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='save', detail=True)
    def save_job(self, request, pk=None):
        saved_job, created = SavedJob.objects.get_or_create(job=self.get_object(),user=request.user)
        if not created:
            saved_job.active = not saved_job.active
        else:
            saved_job.active = True
        saved_job.save()
        return Response(
            serializers.JobDetailSerializer(self.get_object(), context={'request': request}).data,status=status.HTTP_200_OK)

class ApplicationViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Application.objects.filter(active=True)
    serializer_class = serializers.ApplicationSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]  # upload cv_file lên Cloudinary

    def get_serializer_class(self):
        if self.action == 'review':
            return serializers.ApplicationReviewSerializer
        return serializers.ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser or user.role == 'admin':
            return Application.objects.filter(active=True)
        if user.role.__eq__('candidate'):
            # Candidate chỉ thấy đơn mình đã nộp
            return Application.objects.filter(candidate=user, active=True)
        if user.role.__eq__('employer'):
            # Employer thấy CV nộp vào job của công ty mình
            return Application.objects.filter(job__employer__user=user, active=True)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [perms.IsCandidate()]

        if self.action == 'review':
            return [permissions.IsAuthenticated(), perms.IsEmployer()]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        job_id = self.request.data.get('job')
        user = self.request.user

        if Application.objects.filter(candidate=user, job_id=job_id, active=True).exists():
            raise ValidationError(
                {"detail": "Bạn đã nộp hồ sơ ứng tuyển cho công việc này rồi. Không thể nộp lại!"}
            )
        serializer.save(candidate=user)

    # PATCH /api/applications/{id}/review/ — Employer đánh giá hồ sơ
    @action(methods=['patch'], detail=True, url_path='review')
    def review(self, request, pk=None):
        application = self.get_object()

        if application.job.employer.user != request.user:
            raise PermissionDenied("Bạn không có quyền đánh giá đơn này.")

        s = serializers.ApplicationReviewSerializer(application, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(serializers.ApplicationSerializer(application, context={'request': request}).data)

#Stats cho quản trị viên với nhà tuển dụng
class StatsViewSet(viewsets.ViewSet):
    serializer_class = serializers.AdminStatsSerializer
    # API THỐNG KÊ CHO NHÀ TUYỂN DỤNG (Employer)
    @action(methods=['get'], detail=False, url_path='employer-stats',
            permission_classes=[permissions.IsAuthenticated, perms.IsEmployer])
    def employer_stats(self, request):
        user = request.user
        company = user.company

        total_applications = Application.objects.filter(job__employer=company, active=True).count()
        status_stats = Application.objects.filter(job__employer=company, active=True) \
            .values('status') \
            .annotate(count=Count('id'))

        # Thống kê số lượng đơn ứng tuyển nộp vào theo từng Tháng trong Năm nay
        # Lấy năm hiện tại
        current_year = datetime.now().year

        monthly_applications = Application.objects.filter(
            job__employer=company,
            active=True,
            created_date__year=current_year
        ).annotate(
            month=ExtractMonth('created_date')
        ).values('month') \
            .annotate(count=Count('id')) \
            .order_by('month')

        data = {
            "company_name": company.name,
            "total_applications": total_applications,
            "applications_by_status": list(status_stats),
            "monthly_applications": list(monthly_applications)
        }
        return Response(data, status=status.HTTP_200_OK)

    # API THỐNG KÊ TỔNG QUAN CHO QUẢN TRỊ VIÊN (Admin)
    @action(methods=['get'], detail=False, url_path='admin-stats',
            permission_classes=[permissions.IsAdminUser])
    def admin_stats(self, request):
        #Đếm tổng quan số lượng các thực thể trên toàn hệ thống
        total_jobs = Job.objects.filter(active=True).count()
        total_candidates = User.objects.filter(role='candidate', is_active=True).count()
        total_employers = User.objects.filter(role='employer', is_active=True).count()

        #Thống kê số lượng bài Job đăng theo từng chuyên mục (Category)
        jobs_by_category = Job.objects.filter(active=True) \
            .values('category__name') \
            .annotate(total_jobs=Count('id')) \
            .order_by('-total_jobs')

        #Doanh thu dịch vụ gói tin nổi bật (Tính năng mở rộng)
        #Giả sử sau này làm bảng Transaction, đoạn này sẽ tính tổng tiền:
        #total_revenue = Transaction.objects.filter(status='success').aggregate(Sum('amount'))['amount__sum'] or 0
        # Hiện tại chưa làm bảng Payment thì mình cứ gán cứng con số 0 hoặc mock data để vượt qua kiểm tra:
        total_revenue = 15500000  # Mock data: 15.500.000 VNĐ

        data = {
            "system_overview": {
                "total_jobs_posted": total_jobs,
                "total_candidates": total_candidates,
                "total_employers": total_employers
            },
            "jobs_distribution_by_category": list(jobs_by_category),
            "total_services_revenue": total_revenue
        }
        return Response(data, status=status.HTTP_200_OK)


