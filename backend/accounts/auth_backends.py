from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

from .models import Student, Teacher


class UsernameEmailBackend(ModelBackend):
    """
    Authenticate using username, email, registration number, or employee ID.
    This backend is used by both API authenticate() calls and Django admin login.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        login_value = (username or kwargs.get(UserModel.USERNAME_FIELD) or "").strip()
        if not login_value or not password:
            return None

        candidate = (
            UserModel.objects.filter(username__iexact=login_value).first()
            or UserModel.objects.filter(email__iexact=login_value).first()
            or UserModel.objects.filter(registration_number__iexact=login_value).first()
        )

        if not candidate:
            student = Student.objects.select_related("user").filter(registration_number__iexact=login_value).first()
            if student and student.user_id:
                candidate = student.user

        if not candidate:
            teacher = Teacher.objects.select_related("user").filter(employee_id__iexact=login_value).first()
            if teacher and teacher.user_id:
                candidate = teacher.user

        if candidate and candidate.check_password(password) and self.user_can_authenticate(candidate):
            return candidate
        return None
