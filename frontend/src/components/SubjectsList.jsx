import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';
import { getCurrentUser } from '../utils/auth';

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subjectId) => {
    navigate(`/edit-subject/${subjectId}`);
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.delete(`/subjects/${subjectId}/`);
        setSubjects(subjects.filter(s => s.id !== subjectId));
        alert('Subject deleted successfully!');
      } catch (error) {
        console.error('Failed to delete subject', error);
        setError('Failed to delete subject. Please try again.');
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
        <h1 style={{ color: '#1976d2' }}>Subjects List</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/add-subject')}>
            + Add Subject
          </button>
        )}
      </div>

      <div className="card">
        {subjects.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>No subjects found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1976d2' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Code</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => (
                <tr key={subject.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{subject.code}</td>
                  <td style={{ padding: '10px' }}>{subject.name}</td>
                  <td style={{ padding: '10px' }}>
                    {isAdmin && (
                      <>
                        <button 
                          className="btn btn-primary" 
                          style={{ marginRight: '10px' }}
                          onClick={() => handleEdit(subject.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn" 
                          style={{ background: '#f44336', color: 'white' }}
                          onClick={() => handleDelete(subject.id)}
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

export default SubjectsList;
