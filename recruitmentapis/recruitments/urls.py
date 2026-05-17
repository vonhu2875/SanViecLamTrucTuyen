from rest_framework import routers
from recruitments import views
from django.urls import path, include

router = routers.DefaultRouter()
router.register('users',views.UserViewSet, basename='users')
router.register('companies',views.CompanyViewSet, basename='companies')
router.register('applications',views.ApplicationViewSet, basename='applications')
router.register('saved-jobs',views.SavedJobViewSet, basename='saved_jobs')



urlpatterns = [
    path('', include(router.urls))
]