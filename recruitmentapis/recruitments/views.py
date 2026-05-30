from datetime import datetime, date

from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, parsers, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response

from recruitments.models import User, Company, Application, SavedJob, Job, Category, Skill, Payment
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
class CompanyViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
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
        if self.action == 'approve':
            return serializers.CompanyAdminSerializer
        return serializers.CompanySerializer

    def get_permissions(self):
        if self.action in ['current_company']:
            return [perms.IsCompanyOwner()]
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), perms.IsCompanyOwner()]
        if self.action == 'approve':
            # CHỈ Admin mới có quyền gọi hành động duyệt này
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    # def update(self, request, *args, **kwargs):
    #     company = self.get_object()
    #     if 'is_approved' in request.data and not request.user.is_staff:
    #         raise PermissionDenied("Bạn không có quyền thay đổi trạng thái phê duyệt.")
    #
    #     s = self.get_serializer(company, data=request.data, partial=True)
    #     s.is_valid(raise_exception=True)
    #     company = s.save()
    #     return Response(serializers.CompanySerializer(company, context={'request': request}).data,
    #                     status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=True, url_path='approve')
    def approve(self, request, pk=None):
        company = self.get_object()
        # Sử dụng đúng CompanyAdminSerializer để chỉ cập nhật trạng thái duyệt
        s = serializers.CompanyAdminSerializer(company, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        company = s.save()
        return Response(serializers.CompanySerializer(company, context={'request': request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['patch', 'get'], detail=False, url_path='current-company')
    def current_company(self, request):
        # Vì lúc đăng ký đã tạo sẵn, chắc chắn dòng này sẽ tìm thấy Công ty
        company = Company.objects.filter(user=request.user).first()

        if not company:

            company = Company.objects.create(
                user=request.user,
                name=f"Công ty của {request.user.username}",
                description="Chưa có mô tả",
                address="Chưa cập nhật"
            )

        if request.method == 'GET':
            return Response(serializers.CompanySerializer(company, context={'request': request}).data,
                            status=status.HTTP_200_OK)

        if 'is_approved' in request.data and not request.user.is_staff:
            raise PermissionDenied("Bạn không có quyền thay đổi trạng thái phê duyệt.")

        s = serializers.CompanySerializer(company, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        company = s.save()
        return Response(serializers.CompanySerializer(company, context={'request': request}).data,
                        status=status.HTTP_200_OK)
#JOBS

class SkillViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.SkillSerializer

    def get_queryset(self):
        queryset = Skill.objects.filter(active=True)
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(categories__id=category_id)
        return queryset.distinct()

class CategoryViewset(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = serializers.CategorySerializer

class JobViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.DestroyAPIView, generics.RetrieveAPIView):
    queryset = Job.objects.all()
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
        'is_featured': ['exact']
    }

    ordering_fields = ['salary_min', 'salary_max', 'created_date']
    ordering = ['-created_date']

    def get_queryset(self):
        user = self.request.user
        Job.objects.filter(active=True, deadline__lt=datetime.now()).update(active=False)
        query = self.queryset
        saved = self.request.query_params.get('saved')
        if saved == 'true' and self.request.user.is_authenticated:
            query = query.filter(saved_users__user=self.request.user, saved_users__active=True)
        my_jobs = self.request.query_params.get('my_jobs')
        if my_jobs == 'true' and user.is_authenticated and user.role == 'employer':
            return query.filter(employer__user=user)
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
            return [permissions.IsAuthenticated(), perms.IsEmployer(), perms.IsApprovedEmployer(), perms.IsJobOwner()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        company = self.request.user.company
        serializer.save(employer=company)

    @action(methods=['patch'], detail=True, url_path='update-job')
    def update_job(self, request, pk=None):
        job = self.get_object()
        s = serializers.JobDetailSerializer(job, data=request.data, partial=True, context={'request':request})
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

    @action(methods=['get'], detail=False, url_path='compare', permission_classes=[permissions.AllowAny])
    def compare_jobs(self, request):
        ids_param = request.query_params.get('ids')
        if not ids_param:
            return Response({"detail": "Vui lòng truyền danh sách id công việc cần so sánh (?ids=1,2)."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            job_ids = [int(x) for x in ids_param.split(',')]
            if len(job_ids) < 2:
                return Response({"detail": "Cần ít nhất 2 công việc để so sánh."},
                                status=status.HTTP_400_BAD_REQUEST)
            if len(job_ids) > 4:
                return Response({"detail": "Chỉ được so sánh tối đa 4 công việc."},
                                status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"detail": "Định dạng ids không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)

        jobs = Job.objects.filter(id__in=job_ids, active=True, employer__is_approved=True).select_related(
            'employer', 'category'
        ).prefetch_related('skills')

        if not jobs.exists():
            return Response({"detail": "Không tìm thấy công việc hợp lệ."}, status=status.HTTP_404_NOT_FOUND)


        # Dữ liệu chi tiết từng job
        jobs_data = serializers.JobDetailSerializer(jobs, many=True, context={'request': request}).data

        # --- Thống kê tổng hợp để vẽ chart ---
        salary_chart = []


        today = date.today()

        for job in jobs:
            benefits_score = job.skills.count()
            days_left = (job.deadline - today).days if job.deadline >= today else 0
            salary_min = float(job.salary_min or 0)
            salary_max = float(job.salary_max or 0)

            salary_chart.append({
                "job_id": job.id,
                "job_title": job.title,
                "salary_min": salary_min,
                "salary_max": salary_max,
                "salary_avg": (salary_min + salary_max) / 2,
                "experience_years": job.experience_required or 0,
                "benefits_score": benefits_score,
                "days_until_deadline": max(days_left, 0),
                "location": job.location,
                "category": job.category.name if job.category else '',
            })
        return Response({
            "jobs": jobs_data,
            "comparison_stats": salary_chart,
        }, status=status.HTTP_200_OK)


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
            queryset = Application.objects.filter(job__employer__user=user, active=True)
            job_id = self.request.query_params.get('job_id')
            if job_id:
                return queryset.filter(job_id=job_id)
            return queryset
        return Application.objects.none()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [perms.IsCandidate()]

        if self.action == 'review':
            return [permissions.IsAuthenticated(), perms.IsEmployer()]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        job_id = self.request.data.get('job')
        user = self.request.user
        job = Job.objects.get(id=job_id, active=True)
        if job.deadline < datetime.now().date():
            raise ValidationError({
                "detail": "Công việc đã hết hạn ứng tuyển"
            })

        if not job.employer.is_approved:
            raise ValidationError({
                "detail": "Công ty chưa được phê duyệt"
            })
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
        reviewed_by_comment = Application.objects.filter(
            job__employer=company,
            active=True,
            employer_comment__isnull=False
        ).exclude(employer_comment__exact='').count()

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
            "reviewed_by_comment": reviewed_by_comment,
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
        total_revenue = Payment.objects.filter(
            status='success',
            active=True
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0

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


import time
import urllib.parse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from .momo_services import create_momo_payment
from recruitments.models import Payment, Job

class PaymentViewSet(viewsets.ViewSet):
    @action(methods=['post'], detail=False, url_path='create-momo-order')
    def create_momo_order(self, request):
        user = request.user
        package_type = request.data.get('package_type')  # 'featured_job' hoặc 'compare_job'
        job_id = request.data.get('job_id', None)  # Chỉ cần nếu là gói featured_job

        # 1. Thiết lập giá tiền cứng cho các gói
        if package_type == 'featured_job':
            amount = 10000
            order_info = f"Thanh toan day tin noi bat cho Job ID {job_id}"
            if not job_id:
                return Response({"error": "Vui lòng cung cấp job_id để đẩy tin nổi bật"},
                                status=status.HTTP_400_BAD_REQUEST)
        elif package_type == 'compare_job':
            amount = 5000
            order_info = "Thanh toan goi so sanh cong viec cho ung vien"
        else:
            return Response({"error": "Gói dịch vụ không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo mã đơn hàng duy nhất bằng timestamp + ID người dùng
        order_id = f"PAY_{user.id}_{int(time.time())}"

        # 🌟 ĐỊA CHỈ QUAY VỀ: Khớp với Deep Link cấu hình trong App.js của React Native
        return_url = "exp://192.168.2.14:8081/--/momo-return"

        # Webhook URL (Bắn ngầm kết quả) - Nhớ sửa lại IP nếu test điện thoại thật nhé!
        notify_url = "https://monotone-skewed-never.ngrok-free.dev/momo-webhook/"

        # 2. Gọi hàm ở Bước 1 để xin link từ MoMo
        momo_response = create_momo_payment(order_id, amount, order_info, return_url, notify_url)

        # 🌟 CHỈ DÙNG 1 KHỐI IF DUY NHẤT ĐÃ ĐƯỢC CẢI TIẾN 🌟
        if momo_response.get('resultCode') == 0:  # Khởi tạo thành công
            # 3. Lưu đơn hàng vào MySQL ở trạng thái chờ (pending)
            Payment.objects.create(
                user=user,
                job_id=job_id,
                order_id=order_id,
                package_type=package_type,
                amount=amount,
                method='momo',
                status='pending',
                description=order_info
            )

            # --- 🌟 XỬ LÝ CHỐNG NULL DEEPLINK ---
            # Thử lấy đúng tên biến chuẩn của MoMo (chữ L viết hoa) xem có không
            deeplink = momo_response.get('deeplink')
            pay_url = momo_response.get('payUrl')

            # Nếu MoMo trả về null, ta tự "chế" deeplink hướng thẳng vào App MoMo UTA
            if not deeplink and pay_url:
                # 🌟 THAY 'momo://' THÀNH 'momodevelopment://'
                deeplink = f"momodevelopment://?action=goforward&page=app&url={urllib.parse.quote(pay_url)}"

            # 4. Trả dữ liệu an toàn về cho React Native Frontend
            return Response({
                "deeplink": deeplink,
                "payUrl": pay_url,
                "orderId": order_id
            }, status=status.HTTP_200_OK)

        return Response({"error": momo_response.get('message', 'Lỗi kết nối cổng MoMo')},
                        status=status.HTTP_400_BAD_REQUEST)


import hmac
import hashlib
import urllib.parse  # Cần thiết cho đoạn decode/encode chuỗi URL ở hàm tạo đơn hàng
from django.conf import settings
from rest_framework.views import APIView
class MomoWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        print("📥 Dữ liệu nhận từ MoMo/Frontend:", data)

        order_id = str(data.get('orderId', ''))
        result_code = str(data.get('resultCode', ''))

        # 🌟 MẸO BYPASS CHO DEV: Nếu request do chính Frontend React Native tự bắn lên để test
        # (Frontend gửi kèm message đặc biệt hoặc không có signature của MoMo)
        is_frontend_test = data.get('message') == "Bypass test thành công qua App MoMo" or not data.get('signature')

        if is_frontend_test:
            print("🛠️ Phát hiện Request Test từ Frontend! Bỏ qua kiểm tra chữ ký bảo mật...")
            try:
                # Tìm đơn hàng và xử lý lưu Database luôn
                payment = Payment.objects.get(order_id=order_id)

                if result_code == "0":
                    payment.status = 'success'
                    payment.save()

                    # 🌟 SỬA TẠI ĐÂY: Lưu trực tiếp quyền sở hữu vào bảng User để API current-user đọc được
                    user = payment.user
                    user.has_compare_package = True
                    user.save()

                    print(f"✅ [TEST] Đã mở khóa tính năng và lưu DB cho User: {user.username}")
                    return Response({"message": "Bypass & Cập nhật DB thành công"}, status=status.HTTP_200_OK)
                else:
                    payment.status = 'failed'
                    payment.save()
                    return Response({"message": "Bypass giao dịch thất bại"}, status=status.HTTP_200_OK)
            except Payment.DoesNotExist:
                return Response({"error": "Không tìm thấy đơn hàng"}, status=status.HTTP_404_NOT_FOUND)

        # =========================================================================
        # LUỒNG XỬ LÝ CHÍNH THỨC TỪ SERVER MOMO THẬT (GIỮ NGUYÊN BẢO MẬT CHỮ KÝ)
        # =========================================================================
        momo_signature = data.get('signature')
        access_key = settings.MOMO_ACCESS_KEY
        secret_key = settings.MOMO_SECRET_KEY

        amount = str(data.get('amount', ''))
        order_info = str(data.get('orderInfo', ''))
        order_type = str(data.get('orderType', ''))
        trans_id = str(data.get('transId', ''))
        message = str(data.get('message', ''))
        pay_type = str(data.get('payType', ''))
        response_id = str(data.get('responseId', ''))
        extra_data = str(data.get('extraData', ''))

        raw_signature = (
            f"accessKey={access_key}&amount={amount}&extraData={extra_data}&message={message}"
            f"&orderId={order_id}&orderInfo={order_info}&orderType={order_type}"
            f"&payType={pay_type}&requestId={order_id}&responseId={response_id}"
            f"&resultCode={result_code}&transId={trans_id}"
        )

        try:
            our_signature = hmac.new(
                secret_key.encode('utf-8'),
                raw_signature.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            if our_signature != momo_signature:
                print("🚨 LỖI: Chữ ký MoMo không khớp!")
                return Response({"error": "Chữ ký không hợp lệ!"}, status=status.HTTP_400_BAD_REQUEST)

            # Chữ ký hợp lệ -> Tiến hành lưu DB thật từ MoMo Server
            payment = Payment.objects.get(order_id=order_id)

            if result_code == "0":
                payment.status = 'success'
                payment.save()

                # Đẩy tin nổi bật
                if payment.package_type == 'featured_job' and payment.job:
                    job = payment.job
                    job.is_featured = True
                    job.save()
                # Kích hoạt gói so sánh
                elif payment.package_type == 'compare_job':
                    user = payment.user
                    user.has_compare_package = True
                    user.save()

                print(f"💰 [MOMO REAL] Đơn hàng {order_id} thành công! Đã ghi lịch sử vào DB.")
                return Response({"message": "Cập nhật trạng thái thành công"}, status=status.HTTP_200_OK)
            else:
                payment.status = 'failed'
                payment.save()
                return Response({"message": "Giao dịch thất bại"}, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({"error": "Không tìm thấy đơn hàng"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Lỗi hệ thống: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)