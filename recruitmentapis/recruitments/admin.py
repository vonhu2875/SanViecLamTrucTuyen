from django.contrib import admin
from .models import User, Company, Category, Skill, Job, Application, SavedJob, Payment

class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'role', 'is_staff', 'active']
    list_filter = ['role', 'active']
    search_fields = ['username', 'email']

class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'user', 'is_approved', 'created_date']
    list_filter = ['is_approved', 'active']
    search_fields = ['name']
    # Cho phép Admin duyệt nhanh trạng thái doanh nghiệp trực tiếp từ danh sách
    list_editable = ['is_approved']

class JobAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'employer', 'salary_min', 'salary_max', 'is_featured', 'deadline']
    list_filter = ['is_featured', 'location', 'category']
    search_fields = ['title', 'description']
    list_editable = ['is_featured']

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'candidate', 'job', 'status', 'created_date']
    list_filter = ['status']
    list_editable = ['status']

class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'method', 'amount', 'status', 'created_date']
    list_filter = ['method', 'status']

admin.site.register(User, UserAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Category)
admin.site.register(Skill)
admin.site.register(Job, JobAdmin)
admin.site.register(Application, ApplicationAdmin)
admin.site.register(SavedJob)
admin.site.register(Payment, PaymentAdmin)