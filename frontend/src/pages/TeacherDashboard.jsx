import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';
import { getCurrentUser } from '../utils/auth';

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return '#4caf50';
      case 'B': return '#2196f3';
      case 'C': return '#ff9800';
      case 'D': return '#ff5722';
      case 'E': return '#9c27b0';
      case 'F': return '#f44336';
      default: return '#333';
    }
  };

  if (loading) return <div className="content-area">Loading...</div>;

  return (
    <div>
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>
        Welcome, {user?.first_name || user?.username}!
      </h1>
      <p style={{ marginBottom: '30px' }}>
        Your Teacher Dashboard
      </p>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => navigate('/enter-marks')}
          style={{
            padding: '15px 30px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ✏️ Enter Marks
        </button>
        <button 
          onClick={() => navigate('/results')}
          style={{
            padding: '15px 30px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          📋 View Results
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Total Results Entered</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
            {stats?.stats?.total_results || 0}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Students with Marks</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
            {stats?.stats?.students_count || 0}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Subjects Taught</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
            {stats?.stats?.subjects_count || 0}
          </p>
        </div>
      </div>

      {/* Recent Results */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>📋 Recently Entered Results</h3>
        
        {(!stats?.recent_results || stats.recent_results.length === 0) ? (
          <p>No results entered yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1976d2' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Reg No</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Test1</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Test2</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Exam</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Grade</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_results.map((result) => (
                <tr key={result.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{result.registration_number}</td>
                  <td style={{ padding: '10px' }}>{result.full_name}</td>
                  <td style={{ padding: '10px' }}>{result.subject_name}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{result.test1}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{result.test2}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{result.exam_score}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{result.total}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: getGradeColor(result.grade), fontWeight: 'bold' }}>
                    {result.grade}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', color: result.is_pass ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                    {result.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
