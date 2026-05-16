from django.contrib import admin
from recruitments.models import Category

class MyAdminSite(admin.AdminSite):
    site_header = 'RecruitmentApp'

admin_site = MyAdminSite()
admin_site.register(Category)