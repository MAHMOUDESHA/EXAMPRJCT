import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, getUserRole } from './utils/auth';

// Pages
import Navbar from './pages/Navbar';
import Sidebar from './pages/Sidebar';
import Footer from './pages/Footer';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

// Components
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import StudentsList from './components/StudentsList';
import AddStudent from './components/AddStudent';
import EditStudent from './components/EditStudent';
import SubjectsList from './components/SubjectsList';
import AddSubject from './components/AddSubject';
import EditSubject from './components/EditSubject';
import ExamsList from './components/ExamsList';
import AddExam from './components/AddExam';
import EditExam from './components/EditExam';
import Results from './components/Results';
import EnterMarks from './components/EnterMarks';
import EditMarks from './components/EditMarks';

// CSS
import './css/style.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout Component
const AppLayout = ({ children }) => {
  const authenticated = isAuthenticated();
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        {authenticated && <Sidebar />}
        <div style={{ flex: 1, padding: '20px', background: '#e3f2fd' }}>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Dashboard based on user role
const DashboardRouter = () => {
  const role = getUserRole();
  const user = getCurrentUser();
  
  if (role === 'teacher') {
    return <TeacherDashboard />;
  } else if (role === 'student') {
    return <StudentDashboard />;
  } else {
    // Default to admin dashboard for admin users
    return <AdminDashboard />;
  }
};

const AdminRedirect = () => {
  window.location.href = 'https://examprjct.onrender.com/admin/';
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
        <Route path="/logout" element={<AppLayout><Logout /></AppLayout>} />
        <Route path="/register" element={<AppLayout><Register /></AppLayout>} />
        <Route path="/admin" element={<AdminRedirect />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><DashboardRouter /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute>
            <AppLayout><StudentsList /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/add-student" element={
          <ProtectedRoute>
            <AppLayout><AddStudent /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/edit-student/:id" element={
          <ProtectedRoute>
            <AppLayout><EditStudent /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute>
            <AppLayout><SubjectsList /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/add-subject" element={
          <ProtectedRoute>
            <AppLayout><AddSubject /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/edit-subject/:id" element={
          <ProtectedRoute>
            <AppLayout><EditSubject /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/exams" element={
          <ProtectedRoute>
            <AppLayout><ExamsList /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/add-exam" element={
          <ProtectedRoute>
            <AppLayout><AddExam /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/edit-exam/:id" element={
          <ProtectedRoute>
            <AppLayout><EditExam /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <AppLayout><Results /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/enter-marks" element={
          <ProtectedRoute>
            <AppLayout><EnterMarks /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/edit-marks/:id" element={
          <ProtectedRoute>
            <AppLayout><EditMarks /></AppLayout>
          </ProtectedRoute>
        } />
        
        {/* Default Route - redirect to login if not authenticated */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout><DashboardRouter /></AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
