# Exam Marks System

A full-stack web application for managing student exam marks, built with Django REST Framework (backend) and React + Vite (frontend).

## Features

- **User Authentication**: JWT-based authentication with role-based access (Admin, Teacher, Student)
- **Student Management**: Add, edit, and manage student records
- **Subject Management**: Manage subjects with unique codes
- **Exam Management**: Create and manage exams by term and year
- **Marks Entry**: Teachers can enter marks for students (test1, test2, exam score)
- **Results**: Automatic grade calculation (A-F) and pass/fail determination
- **Dashboard**: Role-specific dashboards with statistics

## Tech Stack

### Backend
- Django 5.x
- Django REST Framework
- Simple JWT (Authentication)
- PostgreSQL (Database)
- WhiteNoise (Static files)
- Gunicorn (WSGI Server)

### Frontend
- React 18
- Vite
- React Router
- Axios
- CSS

## Project Structure

```
Exam_Marks_Sys/
├── backend/               # Django backend
│   ├── accounts/         # User accounts app
│   ├── settings.py      # Django settings
│   ├── urls.py          # URL routing
│   ├── wsgi.py          # WSGI config
│   ├── Procfile         # Deployment config
│   └── runtime.txt      # Python version
├── frontend/            # React frontend
│   ├── src/
│   │   ├── api/         # API configuration
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── utils/      # Utility functions
│   └── vite.config.js  # Vite configuration
└── README.md           # This file
```

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Navigate to backend directory:
```
bash
cd backend
```

2. Create virtual environment:
```
bash
python -m venv venv
```

3. Activate virtual environment:
```
bash
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```
bash
pip install -r requirements.txt
```

5. Create PostgreSQL database:
```
bash
createdb ExamMarks_db
```

6. Run migrations:
```
bash
python manage.py migrate
```

7. Create superuser:
```
bash
python manage.py createsuperuser
```

8. Run development server:
```
bash
python manage.py runserver
```

The backend will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```
bash
cd frontend
```

2. Install dependencies:
```
bash
npm install
```

3. Run development server:
```
bash
npm run dev
```

The frontend will run at `http://localhost:5173`

## Deployment to Render

### Backend Deployment

1. Create a Render account at https://render.com

2. Create a new PostgreSQL database:
   - Name: `exammarks`
   - Plan: Free

3. Create a new Web Service:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn settings.wsgi --log-file -`
   - Environment Variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `SECRET_KEY`: Generate a secure secret key
     - `DEBUG`: `False`

4. Deploy and note your backend URL (e.g., `https://your-app.onrender.com`)

### Frontend Deployment

1. Build the frontend:
```
bash
cd frontend
npm run build
```

2. Deploy to Render as a Static Site:
   - Build Command: `npm run build`
   - Publish directory: `dist`
   - Environment Variables:
     - `VITE_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)

### Alternative: Deploy Both Together

You can also serve the React frontend from Django:

1. Build the React frontend:
```
bash
cd frontend
npm run build
```

2. Configure Django to serve static files:
   - The static files will be served from `staticfiles` directory
   - Configure your template settings to include the React build directory

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgres://user:password@localhost:5432/exammarks_db
DB_NAME=ExamMarks_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## API Endpoints

### Authentication
- `POST /api/accounts/auth/register/` - Register new user
- `POST /api/accounts/auth/login/` - Login
- `POST /api/accounts/auth/logout/` - Logout
- `POST /api/accounts/auth/token/refresh/` - Refresh JWT token
- `GET /api/accounts/auth/csrf/` - Get CSRF token

### Students
- `GET /api/accounts/students/` - List students
- `POST /api/accounts/students/` - Create student (Admin only)
- `GET /api/accounts/students/{id}/` - Get student
- `PUT /api/accounts/students/{id}/` - Update student
- `DELETE /api/accounts/students/{id}/` - Delete student

### Teachers
- `GET /api/accounts/teachers/` - List teachers
- `POST /api/accounts/teachers/` - Create teacher (Admin only)

### Subjects
- `GET /api/accounts/subjects/` - List subjects
- `POST /api/accounts/subjects/` - Create subject (Admin only)

### Exams
- `GET /api/accounts/exams/` - List exams
- `POST /api/accounts/exams/` - Create exam (Admin only)

### Results
- `GET /api/accounts/results/` - List results
- `POST /api/accounts/results/` - Create result (Teacher/Admin)
- `GET /api/accounts/results/my_results/` - Get current user's results
- `GET /api/accounts/results/final_marksheet/` - Get final marksheet

### Dashboard
- `GET /api/accounts/dashboard/stats/` - Get dashboard statistics

## User Roles

### Admin
- Full access to all features
- Manage students, teachers, subjects, exams
- View all results and statistics

### Teacher
- Enter and manage marks
- View students in their subjects
- View own entered results

### Student
- View own results
- View exam marksheets
- View dashboard statistics

## License

MIT License
