from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *
from .csrf import get_csrf_token

router = DefaultRouter()
router.register('students', StudentViewSet)
router.register('teachers', TeacherViewSet)
router.register('subjects', SubjectViewSet)
router.register('exams', ExamViewSet)
router.register('results', ResultViewSet)

urlpatterns = [
    # CSRF Token
    path('auth/csrf/', get_csrf_token, name='csrf-token'),
    
    # Auth
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view()),
    
    # API
    path('', include(router.urls)),
    
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view()),
]
