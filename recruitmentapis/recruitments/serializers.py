from rest_framework import serializers
from recruitments.models import User, Company, Application, Job, Category, Skill
from django.utils.html import strip_tags
import html

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
        fields = ['first_name', 'last_name', 'email', 'avatar']

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
    class Meta:
        model = Skill
        fields = ['id', 'name']


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

        if instance.description:
            unescaped_desc = html.unescape(instance.description)
            data['description'] = strip_tags(unescaped_desc).strip()

        if instance.requirements:
            unescaped_req = html.unescape(instance.requirements)
            data['requirements'] = strip_tags(unescaped_req).strip()

        if instance.benefits:
            unescaped_ben = html.unescape(instance.benefits)
            data['benefits'] = strip_tags(unescaped_ben).strip()

        return data

class ApplicantCandidateSerializer(ItemSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'avatar']

class ApplicationSerializer(serializers.ModelSerializer):
    candidate = ApplicantCandidateSerializer(read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_title', 'cv_file', 'cover_letter',
            'status', 'employer_comment', 'created_date', 'candidate'
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