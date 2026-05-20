from rest_framework import serializers
from recruitments.models import User, Company, Application, Job, Category

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

#USER
class SimpleUserSerializer(ItemSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar']

class UserSerializer(ItemSerializer):
    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ['id', 'username', 'role', 'password']
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
            raise serializers.ValidationError("Email không được để trống")
        return email

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(user.password)

        user.is_staff = False
        user.is_superuser = False
        user.save()

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
class CompanyShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name', 'logo']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.logo:
            data['logo'] = instance.logo.url
        return data

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
            'deadline', 'is_featured', 'employer', 'category'
        ]

class JobDetailSerializer(JobSimpleSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(active=True),
        required=True,
        write_only=True
    )
    class Meta:
        model = JobSimpleSerializer.Meta.model
        fields = JobSimpleSerializer.Meta.fields + [
            'description', 'requirements', 'benefits',
            'experience_required', 'created_date', 'updated_date'
        ]
        read_only_fields = ['created_date', 'updated_date']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.category:
            data['category'] = CategoryShortSerializer(instance.category).data
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            data['saved'] = instance.saved_users.filter(user=request.user, active=True).exists()
        else:
            data['saved'] = False
        return data

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'id', 'job', 'cv_file', 'cover_letter',
            'status', 'employer_comment', 'created_date'
        ]
        read_only_fields = ['status', 'employer_comment', 'created_date']

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