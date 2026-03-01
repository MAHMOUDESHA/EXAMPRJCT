from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from .models import *
import random
import string


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'user_type', 'phone_number']
    
    def create(self, validated_data):
        user_type = validated_data.get('user_type', 'student')
        user = User.objects.create_user(**validated_data)
        
        # Create associated profile based on user type
        if user_type == 'student':
            # Generate a unique registration number
            reg_number = 'STU' + ''.join(random.choices(string.digits, k=6))
            while Student.objects.filter(registration_number=reg_number).exists():
                reg_number = 'STU' + ''.join(random.choices(string.digits, k=6))
            
            Student.objects.create(
                user=user,
                full_name=f"{user.first_name} {user.last_name}",
                registration_number=reg_number
            )
            user.registration_number = reg_number
            user.save(update_fields=['registration_number'])
        elif user_type == 'teacher':
            # Generate a unique employee ID
            emp_id = 'TEA' + ''.join(random.choices(string.digits, k=6))
            while Teacher.objects.filter(employee_id=emp_id).exists():
                emp_id = 'TEA' + ''.join(random.choices(string.digits, k=6))
            
            Teacher.objects.create(
                user=user,
                name=f"{user.first_name} {user.last_name}",
                employee_id=emp_id
            )
        
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username_input = (data.get('username') or '').strip()
        password = data.get('password')

        if not username_input or not password:
            raise serializers.ValidationError("Username and password are required")

        # Allow login by username (case-insensitive), email, registration number, or employee ID.
        login_usernames = [username_input]

        user_by_username = User.objects.filter(username__iexact=username_input).first()
        if user_by_username:
            login_usernames.append(user_by_username.username)

        user_by_email = User.objects.filter(email__iexact=username_input).first()
        if user_by_email:
            login_usernames.append(user_by_email.username)

        user_by_reg = User.objects.filter(registration_number__iexact=username_input).first()
        if user_by_reg:
            login_usernames.append(user_by_reg.username)

        student = Student.objects.select_related('user').filter(registration_number__iexact=username_input).first()
        if student and student.user_id:
            login_usernames.append(student.user.username)

        teacher = Teacher.objects.select_related('user').filter(employee_id__iexact=username_input).first()
        if teacher and teacher.user_id:
            login_usernames.append(teacher.user.username)

        for login_username in dict.fromkeys(login_usernames):
            user = authenticate(username=login_username, password=password)
            if user:
                # Keep legacy users in sync for results lookup.
                if not user.registration_number:
                    student_profile = Student.objects.filter(user=user).first()
                    if student_profile and student_profile.registration_number:
                        user.registration_number = student_profile.registration_number
                        user.save(update_fields=['registration_number'])
                return user

        raise AuthenticationFailed("Invalid username or password")


class StudentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Teacher
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'

class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    
    # Allow writable fields for student, subject, exam IDs
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), required=False, allow_null=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), required=False, allow_null=True)
    exam = serializers.PrimaryKeyRelatedField(queryset=Exam.objects.all(), required=False, allow_null=True)
    teacher = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = Result
        fields = '__all__'
    
    def get_student_name(self, obj):
        if obj.student:
            return obj.student.full_name
        return obj.full_name or ''
    
    def get_subject_name(self, obj):
        if obj.subject:
            return obj.subject.name
        return ''
    
    def get_exam_name(self, obj):
        if obj.exam:
            return obj.exam.name
        return ''
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add read-only fields for display
        if instance.student:
            data['registration_number'] = instance.student.registration_number
            data['full_name'] = instance.student.full_name
        else:
            data['registration_number'] = instance.registration_number or ''
            data['full_name'] = instance.full_name or ''
        return data
