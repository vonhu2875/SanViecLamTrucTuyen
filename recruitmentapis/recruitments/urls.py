from rest_framework import routers
from recruitments import views
from django.urls import path, include

from recruitments.views import MomoWebhookView

router = routers.DefaultRouter()
router.register('users',views.UserViewSet, basename='users')
router.register('companies',views.CompanyViewSet, basename='companies')
router.register('jobs',views.JobViewSet, basename='jobs')
router.register('applications',views.ApplicationViewSet, basename='applications')
router.register('stats',views.StatsViewSet, basename='stats')
router.register('categories', viewset=views.CategoryViewset, basename='categories')
router.register('skills',views.SkillViewSet, basename='skills')
router.register('payments', views.PaymentViewSet, basename='payments')
# Ví dụ chuẩn:


urlpatterns = [
    path('', include(router.urls)),
    path('momo-webhook/', MomoWebhookView.as_view(), name='momo-webhook'),
]