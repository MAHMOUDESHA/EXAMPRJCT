from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False)),
                ('username', models.CharField(max_length=150, unique=True)),
                ('first_name', models.CharField(max_length=150)),
                ('last_name', models.CharField(max_length=150)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('date_joined', models.DateTimeField(auto_now_add=True)),
                ('user_type', models.CharField(choices=[('admin', 'Admin'), ('teacher', 'Teacher'), ('student', 'Student')], default='student', max_length=10)),
                ('phone_number', models.CharField(blank=True, max_length=15, null=True)),
                ('registration_number', models.CharField(blank=True, max_length=50, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to.', related_name='user_set', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Exam',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('term', models.CharField(choices=[('1', 'Term I'), ('2', 'Term II'), ('3', 'Term III')], max_length=1)),
                ('year', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=100)),
                ('registration_number', models.CharField(max_length=50, unique=True)),
                ('current_class', models.CharField(blank=True, max_length=20, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='student_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('code', models.CharField(max_length=20, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Teacher',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('employee_id', models.CharField(max_length=50, unique=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='teacher_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Result',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('test1', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('test2', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('exam_score', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('total', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('average', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('grade', models.CharField(blank=True, max_length=2, null=True)),
                ('is_pass', models.BooleanField(default=False)),
                ('remarks', models.CharField(blank=True, max_length=20, null=True)),
                ('exam', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='accounts.exam')),
                ('student', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='results', to='accounts.student')),
                ('subject', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='accounts.subject')),
                ('teacher', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='accounts.teacher')),
            ],
        ),
    ]
