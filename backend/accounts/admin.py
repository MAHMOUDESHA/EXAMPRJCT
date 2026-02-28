from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Student, Teacher, Subject, Exam, Result


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'user_type', 'is_staff']
    list_filter = ['user_type', 'is_staff', 'is_superuser']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('User Info', {'fields': ('user_type', 'phone_number', 'registration_number')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('User Info', {'fields': ('user_type', 'phone_number')}),
    )


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'full_name', 'current_class', 'user']
    search_fields = ['registration_number', 'full_name']
    list_filter = ['current_class']


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'name', 'user']
    search_fields = ['employee_id', 'name']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['name', 'term', 'year']
    list_filter = ['term', 'year']
    search_fields = ['name']


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'full_name', 'subject', 'exam', 'total', 'grade', 'is_pass']
    list_filter = ['exam', 'grade', 'is_pass']
    search_fields = ['registration_number', 'full_name', 'subject__name']
    readonly_fields = ['total', 'average', 'grade', 'is_pass', 'remarks']
