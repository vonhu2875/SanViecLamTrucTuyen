from django.contrib import admin
from recruitments.models import Category, Company, Job, Application, Skill, User

class MyAdminSite(admin.AdminSite):
    site_header = 'RecruitmentApp'

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'active', 'created_date', 'updated_date']
    search_fields = ['name']
    list_filter = ['active']
    list_editable = ['active']

class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'user', 'is_approved', 'active', 'created_date']
    list_editable = ['is_approved', 'active']
    list_filter = ['is_approved', 'active']
    search_fields = ['name', 'user__username']

class SkillAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

class JobAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'employer', 'category', 'location', 'salary_min', 'salary_max', 'active']
    list_filter = ['location', 'category', 'active']
    search_fields = ['title', 'employer__name']
    list_editable = ['active']

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'job', 'candidate', 'status', 'created_date']
    list_filter = ['status']
    search_fields = ['job__title', 'candidate__username']

class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'last_name', 'first_name', 'is_active', 'email', 'role', 'phone']
    search_fields = ['username', 'phone', 'email',]
    list_editable = ['is_active']
    list_filter = ['is_active', 'role']


admin_site = MyAdminSite()
admin_site.register(Category, CategoryAdmin)
admin_site.register(Company, CompanyAdmin)
admin_site.register(Job, JobAdmin)
admin_site.register(Application, ApplicationAdmin)
admin_site.register(Skill, SkillAdmin)
admin_site.register(User, UserAdmin)