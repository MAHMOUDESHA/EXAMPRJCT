from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import models
from .models import *
from .serializers import *

# ------------------------------------------------------------
# PERMISSIONS (Rahisi)
# ------------------------------------------------------------
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'admin'

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'teacher'

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'student'

class IsAdminOrTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in ['admin', 'teacher']

# ------------------------------------------------------------
# AUTH VIEWS
# ------------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        
        refresh = RefreshToken.for_user(user)
        
        # Get CSRF token for the response
        from django.middleware.csrf import get_token
        csrf_token = get_token(request)
        
        return Response({
            'user': UserSerializer(user).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'csrf_token': csrf_token
        })

class LogoutView(generics.GenericAPIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

# ------------------------------------------------------------
# VIEWSETS (CRUD automatic!)
# ------------------------------------------------------------
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            self.permission_classes = [IsAdmin]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            self.permission_classes = [IsAdmin]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            self.permission_classes = [IsAdmin]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            self.permission_classes = [IsAdmin]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminOrTeacher]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        # Validate 9 subjects limit per student per exam
        student_id = request.data.get('student')
        exam_id = request.data.get('exam')
        
        if student_id and exam_id:
            existing_count = Result.objects.filter(student_id=student_id, exam_id=exam_id).count()
            if existing_count >= 9:
                return Response(
                    {'error': f'Cannot add more than 9 subjects for this student in this exam. Currently: {existing_count}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        # If user is admin, try to get teacher profile; if not found, save without teacher
        if self.request.user.user_type == 'admin':
            try:
                teacher = Teacher.objects.get(user=self.request.user)
                serializer.save(teacher=teacher)
            except Teacher.DoesNotExist:
                serializer.save(teacher=None)
        else:
            teacher = Teacher.objects.get(user=self.request.user)
            serializer.save(teacher=teacher)
    
    @action(detail=False, methods=['get'])
    def my_results(self, request):
        # Try to get student profile first
        try:
            student = Student.objects.get(user=request.user)
            # Include both results linked to student AND by registration_number
            results = Result.objects.filter(
                models.Q(student=student) | models.Q(registration_number=student.registration_number)
            ).distinct()
            serializer = self.get_serializer(results, many=True)
            return Response(serializer.data)
        except Student.DoesNotExist:
            # If no student profile exists, try using user's registration_number if available
            reg_number = getattr(request.user, 'registration_number', None) or getattr(request.user, 'username', None)
            if reg_number:
                results = Result.objects.filter(registration_number=reg_number)
                serializer = self.get_serializer(results, many=True)
                return Response(serializer.data)
            return Response([])
    
    @action(detail=False, methods=['post'])
    def view_by_admission(self, request):
        admission = request.data.get('admission_number')
        exam_id = request.data.get('exam_id')
        
        try:
            student = Student.objects.get(admission_number=admission)
            results = Result.objects.filter(student=student, exam_id=exam_id)
            serializer = self.get_serializer(results, many=True)
            return Response(serializer.data)
        except:
            return Response({'error': 'Not found'}, status=404)

    @action(detail=False, methods=['get'])
    def final_marksheet(self, request):
        """
        Get final marksheet for a student for a specific exam
        """
        student_id = request.query_params.get('student_id')
        exam_id = request.query_params.get('exam_id')
        
        if not student_id or not exam_id:
            return Response({'error': 'student_id and exam_id are required'}, status=400)
        
        try:
            student = Student.objects.get(id=student_id)
            exam = Exam.objects.get(id=exam_id)
            results = Result.objects.filter(student=student, exam=exam).select_related('subject', 'exam', 'student')
            
            if not results.exists():
                return Response({'error': 'No results found for this student and exam'}, status=404)
            
            # Calculate totals
            total_test1 = sum(float(r.test1) for r in results)
            total_test2 = sum(float(r.test2) for r in results)
            total_exam_score = sum(float(r.exam_score) for r in results)
            total_marks = total_test1 + total_test2 + total_exam_score
            
            # Calculate average (per subject average, then averaged)
            subject_count = results.count()
            avg_total = total_marks / subject_count if subject_count > 0 else 0
            
            # Calculate GPA (grade points average)
            grade_points = {'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0}
            total_points = sum(grade_points.get(r.grade, 0) for r in results)
            gpa = total_points / subject_count if subject_count > 0 else 0
            
            # Determine final grade based on GPA
            if gpa >= 4.5: final_grade = 'A'
            elif gpa >= 3.5: final_grade = 'B'
            elif gpa >= 2.5: final_grade = 'C'
            elif gpa >= 1.5: final_grade = 'D'
            elif gpa >= 0.5: final_grade = 'E'
            else: final_grade = 'F'
            
            # Determine pass/fail
            is_pass = final_grade != 'F'
            
            # Serialize individual results
            result_serializer = ResultSerializer(results, many=True)
            
            data = {
                'student': {
                    'id': student.id,
                    'registration_number': student.registration_number,
                    'full_name': student.full_name,
                    'current_class': student.current_class,
                },
                'exam': {
                    'id': exam.id,
                    'name': exam.name,
                    'term': exam.term,
                    'year': exam.year,
                },
                'subjects_count': subject_count,
                'summary': {
                    'total_test1': round(total_test1, 2),
                    'total_test2': round(total_test2, 2),
                    'total_exam': round(total_exam_score, 2),
                    'total_marks': round(total_marks, 2),
                    'average': round(avg_total, 2),
                    'gpa': round(gpa, 2),
                    'total_points': total_points,
                    'final_grade': final_grade,
                    'is_pass': is_pass,
                    'remarks': 'PASS' if is_pass else 'FAIL',
                },
                'results': result_serializer.data
            }
            
            return Response(data)
            
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=404)
        except Exam.DoesNotExist:
            return Response({'error': 'Exam not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def student_exams(self, request):
        """
        Get list of exams for a specific student with their results
        """
        student_id = request.query_params.get('student_id')
        
        if not student_id:
            return Response({'error': 'student_id is required'}, status=400)
        
        try:
            student = Student.objects.get(id=student_id)
            # Get distinct exams for this student
            exam_ids = Result.objects.filter(student=student).values_list('exam_id', flat=True).distinct()
            exams = Exam.objects.filter(id__in=exam_ids)
            
            exam_list = []
            for exam in exams:
                results = Result.objects.filter(student=student, exam=exam)
                subject_count = results.count()
                
                # Calculate GPA for this exam
                grade_points = {'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0}
                total_points = sum(grade_points.get(r.grade, 0) for r in results)
                gpa = total_points / subject_count if subject_count > 0 else 0
                
                # Determine final grade
                if gpa >= 4.5: final_grade = 'A'
                elif gpa >= 3.5: final_grade = 'B'
                elif gpa >= 2.5: final_grade = 'C'
                elif gpa >= 1.5: final_grade = 'D'
                elif gpa >= 0.5: final_grade = 'E'
                else: final_grade = 'F'
                
                exam_list.append({
                    'id': exam.id,
                    'name': exam.name,
                    'term': exam.term,
                    'year': exam.year,
                    'subjects_count': subject_count,
                    'gpa': round(gpa, 2),
                    'final_grade': final_grade,
                })
            
            return Response(exam_list)
            
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def subject_count(self, request):
        """
        Get the number of subjects entered for a student in an exam
        """
        student_id = request.query_params.get('student_id')
        exam_id = request.query_params.get('exam_id')
        
        if not student_id or not exam_id:
            return Response({'error': 'student_id and exam_id are required'}, status=400)
        
        try:
            count = Result.objects.filter(student_id=student_id, exam_id=exam_id).count()
            can_add_more = count < 9
            return Response({
                'subject_count': count,
                'can_add_more': can_add_more,
                'max_subjects': 9
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

# ------------------------------------------------------------
# DASHBOARD STATS
# ------------------------------------------------------------
class DashboardStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.user_type == 'admin':
            # Admin gets overall statistics
            total_students = Student.objects.count()
            total_teachers = Teacher.objects.count()
            total_subjects = Subject.objects.count()
            total_exams = Exam.objects.count()
            total_results = Result.objects.count()
            
            # Calculate pass rate
            passed_results = Result.objects.filter(is_pass=True).count()
            pass_rate = round((passed_results / total_results * 100), 1) if total_results > 0 else 0
            
            data = {
                'user_type': 'admin',
                'stats': {
                    'students': total_students,
                    'teachers': total_teachers,
                    'subjects': total_subjects,
                    'exams': total_exams,
                    'total_results': total_results,
                    'pass_rate': pass_rate,
                }
            }
            
        elif user.user_type == 'teacher':
            teacher = Teacher.objects.filter(user=user).first()
            if not teacher:
                # Legacy account without teacher profile
                return Response({
                    'user_type': 'teacher',
                    'stats': {
                        'total_results': 0,
                        'students_count': 0,
                        'subjects_count': 0,
                    },
                    'recent_results': [],
                    'warning': 'Teacher profile not found for this account.',
                })
            
            # Get results entered by this teacher
            teacher_results = Result.objects.filter(teacher=teacher)
            total_results = teacher_results.count()
            
            # Get unique students this teacher has entered marks for
            students_with_marks = teacher_results.values('student').distinct().count()
            
            # Get subjects this teacher has entered marks for
            subjects_taught = teacher_results.values('subject').distinct().count()
            
            # Recent results
            recent_results = teacher_results.order_by('-id')[:5]
            
            data = {
                'user_type': 'teacher',
                'stats': {
                    'total_results': total_results,
                    'students_count': students_with_marks,
                    'subjects_count': subjects_taught,
                },
                'recent_results': ResultSerializer(recent_results, many=True).data
            }
            
        elif user.user_type == 'student':
            # Try to get student profile, handle case if not exists
            try:
                student = Student.objects.get(user=user)
                student_reg_number = student.registration_number
            except Student.DoesNotExist:
                student = None
                student_reg_number = user.registration_number or user.username
            
            # Get student's results - include both results linked to student and by registration_number
            if student:
                student_results = Result.objects.filter(
                    models.Q(student=student) | models.Q(registration_number=student.registration_number)
                ).distinct()
                student_info = {
                    'registration_number': student.registration_number,
                    'full_name': student.full_name,
                    'current_class': student.current_class,
                }
            else:
                # If no student profile, try to get results by registration_number
                student_results = Result.objects.filter(registration_number=student_reg_number)
                student_info = {
                    'registration_number': student_reg_number,
                    'full_name': user.first_name + ' ' + user.last_name,
                    'current_class': None,
                }
            total_subjects = student_results.count()
            
            # Calculate average
            if total_subjects > 0:
                average = round(sum(float(r.average) for r in student_results) / total_subjects, 2)
            else:
                average = 0
            
            # Calculate total marks (sum of all subject totals)
            if total_subjects > 0:
                total_marks = round(sum(float(r.total) for r in student_results), 2)
            else:
                total_marks = 0
            
            # Calculate GPA (grade points average)
            grade_points = {'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0}
            if total_subjects > 0:
                total_points = sum(grade_points.get(r.grade, 0) for r in student_results)
                gpa = round(total_points / total_subjects, 2)
            else:
                gpa = 0
            
            # Determine overall grade based on GPA
            if gpa >= 4.5: overall_grade = 'A'
            elif gpa >= 3.5: overall_grade = 'B'
            elif gpa >= 2.5: overall_grade = 'C'
            elif gpa >= 1.5: overall_grade = 'D'
            elif gpa >= 0.5: overall_grade = 'E'
            else: overall_grade = 'F'
            
            # Pass/fail count
            passed = student_results.filter(is_pass=True).count()
            failed = student_results.filter(is_pass=False).count()
            
            # Get grades distribution
            grades = student_results.values('grade').annotate(count=models.Count('grade'))
            grade_distribution = {g['grade']: g['count'] for g in grades}
            
            # All results for the student
            all_results = student_results.order_by('-exam__year', '-exam__term')
            
            data = {
                'user_type': 'student',
                'student_info': student_info,
                'stats': {
                    'total_subjects': total_subjects,
                    'average': average,
                    'total_marks': total_marks,
                    'gpa': gpa,
                    'overall_grade': overall_grade,
                    'passed': passed,
                    'failed': failed,
                    'grade_distribution': grade_distribution,
                },
                'results': ResultSerializer(all_results, many=True).data
            }
        else:
            data = {'error': 'Invalid user type'}
            
        return Response(data)

# Create your views here.
