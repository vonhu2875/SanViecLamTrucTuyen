from django.contrib import admin
from recruitments.models import Category, Company, Job, Application

class MyAdminSite(admin.AdminSite):
    site_header = 'RecruitmentApp'


class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'active', 'created_date', 'updated_date']
    search_fields = ['name']
    list_filter = ['active']

class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'user', 'is_approved', 'created_date']
    list_editable = ['is_approved']
    list_filter = ['is_approved', 'active']
    search_fields = ['name', 'user__username']



admin_site = MyAdminSite()
admin_site.register(Category, CategoryAdmin)
admin_site.register(Company, CompanyAdmin)
admin_site.register(Job)
admin_site.register(Application)