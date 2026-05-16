from rest_framework import routers
from recruitments import views
from django.urls import path, include

router = routers.DefaultRouter()
router.register('users',views.UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls))
]