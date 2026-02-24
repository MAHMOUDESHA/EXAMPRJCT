import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import api from '../api/axios.jsx';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

const AdminDashboard = () => {
  const user = getCurrentUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats/');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  // Route to appropriate dashboard based on user type
  if (user?.user_type === 'student') {
    return <StudentDashboard />;
  }

  if (user?.user_type === 'teacher') {
    return <TeacherDashboard />;
  }

  // Admin Dashboard (original)
  if (loading) return <div className="content-area">Loading...</div>;

  const stats = data?.stats || {};

  return (
    <div>
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>
        Welcome, {user?.first_name || user?.username}!
      </h1>
      <p style={{ marginBottom: '30px' }}>
        You are logged in as <strong>Admin</strong>
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Total Students</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1976d2' }}>{stats.students || 0}</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Total Teachers</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50' }}>{stats.teachers || 0}</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Subjects</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800' }}>{stats.subjects || 0}</p>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Exams</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#9c27b0' }}>{stats.exams || 0}</p>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Total Results</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#e91e63' }}>{stats.total_results || 0}</p>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Pass Rate</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: stats.pass_rate >= 50 ? '#4caf50' : '#f44336' }}>
            {stats.pass_rate || 0}%
          </p>
        </div>
      </div>

      {/* Quick Actions for Admin */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        <a href="/students" style={{
          display: 'block',
          background: '#1976d2',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s'
        }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>👥</span>
          <strong>Manage Students</strong>
        </a>
        
        <a href="/subjects" style={{
          display: 'block',
          background: '#4caf50',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s'
        }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>📚</span>
          <strong>Manage Subjects</strong>
        </a>

        <a href="/results" style={{
          display: 'block',
          background: '#ff9800',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s'
        }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>📋</span>
          <strong>View Results</strong>
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;
