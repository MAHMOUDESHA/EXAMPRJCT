from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    USER_TYPES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='student')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    registration_number = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} - {self.user_type}"


class Student(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    full_name = models.CharField(max_length=100)
    registration_number = models.CharField(max_length=50, unique=True)
    current_class = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return self.registration_number
    


class Teacher(models.Model):
    name = models.CharField(max_length=100)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.employee_id

class Exam(models.Model):
    TERM_CHOICES = [
        ('1', 'Term I'),
        ('2', 'Term II'),
        ('3', 'Term III'),
    ]
    
    name = models.CharField(max_length=100)
    term = models.CharField(max_length=1, choices=TERM_CHOICES)
    year = models.IntegerField()
    
    def __str__(self):
        return f"{self.name} - Term {self.term} {self.year}"
    
class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.name


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='results')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True, related_name='results')
    registration_number = models.CharField(max_length=50, blank=True, null=True)  
    full_name = models.CharField(max_length=100, blank=True, null=True)           
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, null=True, blank=True)     
    
    test1 = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    test2 = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    exam_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    total = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    average = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    grade = models.CharField(max_length=2, blank=True, null=True)
    is_pass = models.BooleanField(default=False)  
    remarks = models.CharField(max_length=20, blank=True, null=True)  
    
    def save(self, *args, **kwargs):
        # Auto-fill from student if available
        if self.student and not self.registration_number:
            self.registration_number = self.student.registration_number
        if self.student and not self.full_name:
            self.full_name = self.student.full_name
            
        self.total = self.test1 + self.test2 + self.exam_score
        self.average = self.total / 3
        
        if self.average >= 75: self.grade = 'A'
        elif self.average >= 65: self.grade = 'B'
        elif self.average >= 45: self.grade = 'C'
        elif self.average >= 35: self.grade = 'D'
        elif self.average >= 25: self.grade = 'E'
        else: self.grade = 'F'
        
        if self.grade == 'F' or self.average < 30:
            self.is_pass = False
            self.remarks = 'FAIL'
        else:
            self.is_pass = True
            self.remarks = 'PASS'
        
        super().save(*args, **kwargs)

    
    def __str__(self):
        return f"{self.registration_number} - {self.subject} - {self.grade}"
