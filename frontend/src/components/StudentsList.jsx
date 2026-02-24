import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';
import { getCurrentUser } from '../utils/auth';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (studentId) => {
    navigate(`/edit-student/${studentId}`);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${studentId}/`);
        setStudents(students.filter(s => s.id !== studentId));
        alert('Student deleted successfully!');
      } catch (error) {
        console.error('Failed to delete student', error);
        setError('Failed to delete student. Please try again.');
      }
    }
  };

  const isAdmin = user?.user_type === 'admin';

  if (loading) return <div className="content-area">Loading...</div>;

  return (
    <div className="content-area">
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ color: '#1976d2' }}>Students List</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/add-student')}>
            + Add Student
          </button>
        )}
      </div>

      <div className="card">
        {students.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>No students found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1976d2' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Reg Number</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Class</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{student.registration_number}</td>
                  <td style={{ padding: '10px' }}>{student.full_name}</td>
                  <td style={{ padding: '10px' }}>{student.current_class}</td>
                  <td style={{ padding: '10px' }}>
                    {isAdmin && (
                      <>
                        <button 
                          className="btn btn-primary" 
                          style={{ marginRight: '10px' }}
                          onClick={() => handleEdit(student.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn" 
                          style={{ background: '#f44336', color: 'white' }}
                          onClick={() => handleDelete(student.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
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

export default StudentsList;
