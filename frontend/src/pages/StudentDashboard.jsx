import React, { useState, useEffect } from 'react';
import api from '../api/axios.jsx';
import { getCurrentUser } from '../utils/auth';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

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
        Your Student Dashboard
      </p>

      {/* Student Info */}
      {stats?.student_info && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>📋 Student Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>Registration Number:</strong>
              <p>{stats.student_info.registration_number}</p>
            </div>
            <div>
              <strong>Full Name:</strong>
              <p>{stats.student_info.full_name}</p>
            </div>
            <div>
              <strong>Class:</strong>
              <p>{stats.student_info.current_class || 'Not assigned'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Total Subjects</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1976d2' }}>
            {stats?.stats?.total_subjects || 0}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Total Marks</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0' }}>
            {stats?.stats?.total_marks || 0}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Average Score</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>
            {stats?.stats?.average || 0}%
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>GPA</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
            {stats?.stats?.gpa || 0}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Overall Grade</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: getGradeColor(stats?.stats?.overall_grade) 
          }}>
            {stats?.stats?.overall_grade || '-'}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Passed</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>
            {stats?.stats?.passed || 0}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3>Failed</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336' }}>
            {stats?.stats?.failed || 0}
          </p>
        </div>
      </div>

      {/* Grade Distribution */}
      {stats?.stats?.grade_distribution && Object.keys(stats.stats.grade_distribution).length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>📊 Grade Distribution</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(stats.stats.grade_distribution).map(([grade, count]) => (
              <div key={grade} style={{
                textAlign: 'center',
                padding: '15px',
                background: getGradeColor(grade) + '20',
                borderRadius: '8px',
                minWidth: '60px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getGradeColor(grade) }}>
                  {grade}
                </div>
                <div>{count} subject{count !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>📋 My Results</h3>
        
        {(!stats?.results || stats.results.length === 0) ? (
          <p>No results found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1976d2' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Exam</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Test1</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Test2</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Exam</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Average</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Grade</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.results.map((result) => (
                <tr key={result.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{result.subject_name}</td>
                  <td style={{ padding: '10px' }}>{result.exam_name}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{result.test1}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{result.test2}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{result.exam_score}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{result.total}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{result.average}</td>
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

export default StudentDashboard;
