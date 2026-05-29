from datetime import datetime
from rest_framework import serializers
from recruitments.models import User, Company, Application, Job, Category, Skill, Payment


class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

#USER
class CompanyShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id','name', 'logo', 'is_approved']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.logo:
            data['logo'] = instance.logo.url
        return data

class SimpleUserSerializer(ItemSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar', 'phone']

class UserSerializer(ItemSerializer):
    company = CompanyShortSerializer(read_only=True)
    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ['id', 'username', 'role', 'password', 'company']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def validate_role(self, role):
        if role == 'admin':
            raise serializers.ValidationError("Không được chọn role Admin")
        return role

    def validate_avatar(self, avatar):
        if not avatar:
            raise serializers.ValidationError("Avatar không được để trống")
        return avatar

    def validate_email(self, email):

        if not email:
            raise serializers.ValidationError(
                "Email không được để trống"
            )

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                "Email đã tồn tại"
            )
        return email

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError(
                "Username không được để trống"
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Tên tài khoản đã tồn tại.")
        return value


    def create(self, validated_data):
        # 1. Lấy role ra để kiểm tra trước
        role = validated_data.get('role', 'candidate')

        # 2. GIỮ NGUYÊN: Gọi hàm này của Django để băm mật khẩu an toàn
        user = User.objects.create_user(**validated_data)

        # 3.Nếu role là employer, tự động tạo hồ sơ công ty rỗng gắn với user vừa tạo
        if role == 'employer':
            Company.objects.create(
                user=user,
                name=f"Công ty của {user.username}",  # Tên tạm thời
                description="Chưa có mô tả chi tiết",
                address="Chưa cập nhật địa chỉ",
                is_approved=False,  # Mặc định chưa được duyệt
                active=True
            )

        return user

#COMPANY
class CompanySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name','description', 'logo', 'address', 'website', 'active']

class CompanySerializer(CompanySimpleSerializer):
    class Meta:
        model  = CompanySimpleSerializer.Meta.model

        fields = CompanySimpleSerializer.Meta.fields + ['id', 'is_approved', 'created_date', 'updated_date']
        read_only_fields = ['created_date', 'updated_date', 'is_approved']


    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.logo:
            data['logo'] = instance.logo.url
        return data
        if instance.created_date:
            data['created_date'] = instance.created_date.strftime("%d/%m/%Y %H:%M:%S")
        if instance.updated_date:
            data['updated_date'] = instance.updated_date.strftime("%d/%m/%Y %H:%M:%S")
        return data

class CompanyAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['is_approved', 'created_date', 'updated_date']

#JOB


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name']

class CategoryShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']

class JobSimpleSerializer(serializers.ModelSerializer):
    employer = CompanyShortSerializer(read_only=True)
    category = CategoryShortSerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'location', 'salary_min', 'salary_max',
            'deadline', 'is_featured', 'employer', 'category', 'active'
        ]

class SkillSerializer(serializers.ModelSerializer):
    category_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,
        source='categories'
    )

    class Meta:
        model = Skill
        fields = ['id', 'name', 'category_ids']


class JobDetailSerializer(JobSimpleSerializer):
    skills = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        required=False
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(active=True),
        required=True,
        write_only=True
    )

    class Meta:
        model = JobSimpleSerializer.Meta.model
        fields = JobSimpleSerializer.Meta.fields + [
            'description', 'requirements', 'benefits',
            'experience_required', 'created_date', 'updated_date', 'skills'
        ]
        read_only_fields = ['created_date', 'updated_date']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.category:
            data['category'] = CategorySerializer(instance.category).data
        if instance.skills:
            data['skills'] = SkillSerializer(instance.skills.all(), many=True).data

        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            data['saved'] = instance.saved_users.filter(user=request.user, active=True).exists()
        else:
            data['saved'] = False

        return data

    def validate(self, attrs):
        salary_min = attrs.get('salary_min')
        salary_max = attrs.get('salary_max')
        deadline = attrs.get('deadline')
        title = attrs.get('title')

        if salary_min is not None and salary_max is not None:
            if salary_min < 0 or salary_max < 0:
                raise serializers.ValidationError(
                    "Lương không được âm"
                )

        if salary_min > salary_max:
            raise serializers.ValidationError(
                "salary_min phải nhỏ hơn salary_max"
            )
        if deadline and deadline < datetime.now().date():
            raise serializers.ValidationError({
                "deadline": "Hạn nộp hồ sơ phải lớn hơn ngày hiện tại"
            })

        return attrs

class ApplicantCandidateSerializer(ItemSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'avatar']

class ApplicationSerializer(serializers.ModelSerializer):
    candidate = ApplicantCandidateSerializer(read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_location = serializers.CharField(source='job.location', read_only=True)
    company_name = serializers.CharField(source='job.employer.name', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_title', 'cv_file', 'cover_letter',
            'status', 'employer_comment', 'created_date', 'candidate', 'company_name', 'job_location'
        ]
        read_only_fields = ['status', 'employer_comment', 'created_date']

    def validate_cv_file(self, value):
        if value:
            # 1. Lấy tên file gốc (ví dụ: "my_cv.docx")
            file_name = value.name.lower()

            # 2. Định nghĩa các đuôi file hợp lệ (.doc, .docx)
            valid_extensions = ['.doc', '.docx', '.pdf']

            # 3. Kiểm tra xem file nộp vào có kết thúc bằng đuôi hợp lệ không
            has_valid_extension = any(file_name.endswith(ext) for ext in valid_extensions)

            if not has_valid_extension:
                raise serializers.ValidationError(
                    "Định dạng file không hợp lệ! Hệ thống chỉ chấp nhận file Word (.doc, .docx)."
                )

        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.cv_file:
            data['cv_file'] = instance.cv_file.url
        return data

class ApplicationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status', 'employer_comment']

# Cho thống kê của Nhà tuyển dụng
class EmployerStatsSerializer(serializers.Serializer):
    pass

# Cho thống kê tổng quan của Admin
class AdminStatsSerializer(serializers.Serializer):
    pass

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'job', 'method', 'status', 'amount', 'description', 'created_date']
        read_only_fields = ['status', 'created_date']