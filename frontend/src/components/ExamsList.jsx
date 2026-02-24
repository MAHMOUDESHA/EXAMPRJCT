import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';
import { getCurrentUser } from '../utils/auth';

const ExamsList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams/');
      setExams(response.data);
    } catch (error) {
      console.error('Failed to fetch exams', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (examId) => {
    navigate(`/edit-exam/${examId}`);
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await api.delete(`/exams/${examId}/`);
        setExams(exams.filter(e => e.id !== examId));
        alert('Exam deleted successfully!');
      } catch (error) {
        console.error('Failed to delete exam', error);
        setError('Failed to delete exam. Please try again.');
      }
    }
  };

  const isAdmin = user?.user_type === 'admin';

  const getTermName = (term) => {
    const terms = { '1': 'Term I', '2': 'Term II', '3': 'Term III' };
    return terms[term] || term;
  };

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
        <h1 style={{ color: '#1976d2' }}>Exams List</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/add-exam')}>
            + Add Exam
          </button>
        )}
      </div>

      <div className="card">
        {exams.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>No exams found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1976d2' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Term</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Year</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{exam.name}</td>
                  <td style={{ padding: '10px' }}>{getTermName(exam.term)}</td>
                  <td style={{ padding: '10px' }}>{exam.year}</td>
                  <td style={{ padding: '10px' }}>
                    {isAdmin && (
                      <>
                        <button 
                          className="btn btn-primary" 
                          style={{ marginRight: '10px' }}
                          onClick={() => handleEdit(exam.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn" 
                          style={{ background: '#f44336', color: 'white' }}
                          onClick={() => handleDelete(exam.id)}
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

export default ExamsList;
