import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';
import { getCurrentUser } from '../utils/auth';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      let response;
      if (user?.user_type === 'student') {
        response = await api.get('/results/my_results/');
      } else {
        response = await api.get('/results/');
      }
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch results', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-marks/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this marks record?')) {
      return;
    }
    
    try {
      await api.delete(`/results/${id}/`);
      alert('Marks deleted successfully');
      fetchResults();
    } catch (error) {
      console.error('Failed to delete marks', error);
      alert('Failed to delete marks');
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

  const canManageMarks = user?.user_type === 'teacher' || user?.user_type === 'admin';

  // ===== HELPER FUNCTIONS (WEKA HAPA) =====
  const groupResultsByStudent = (results) => {
    const grouped = {};
    
    results.forEach(result => {
      const key = result.registration_number;
      if (!grouped[key]) {
        grouped[key] = {
          registration_number: result.registration_number,
          full_name: result.full_name,
          subjects: []
        };
      }
      grouped[key].subjects.push(result);
    });
    
    return Object.values(grouped);
  };

  const calculateStudentGPA = (subjects) => {
    if (subjects.length === 0) return '0.00';
    
    const gradePoints = {
      'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0
    };
    
    const totalPoints = subjects.reduce((sum, subj) => {
      return sum + (gradePoints[subj.grade] || 0);
    }, 0);
    
    return (totalPoints / subjects.length).toFixed(2);
  };

  const calculateStudentTotal = (subjects) => {
    return subjects.reduce((sum, subj) => sum + parseFloat(subj.total), 0).toFixed(2);
  };

  const calculateStudentAverage = (subjects) => {
    if (subjects.length === 0) return '0.00';
    const total = subjects.reduce((sum, subj) => sum + parseFloat(subj.average), 0);
    return (total / subjects.length).toFixed(2);
  };
  // ===== MWISHO WA HELPER FUNCTIONS =====

  const studentsData = groupResultsByStudent(results);

  if (loading) return <div className="content-area">Loading...</div>;

  return (
    <div className="content-area">
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Results</h1>

      <div className="card">
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div>
            {studentsData.map(student => (
              <div key={student.registration_number} style={{ 
                marginBottom: '40px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                {/* Student Header */}
                <div style={{ 
                  background: '#1976d2', 
                  color: 'white', 
                  padding: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0 }}>
                    🧑‍🎓 {student.full_name} ({student.registration_number})
                  </h3>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span>Total: {calculateStudentTotal(student.subjects)}</span>
                    <span>Average: {calculateStudentAverage(student.subjects)}%</span>
                    <span>GPA: {calculateStudentGPA(student.subjects)}</span>
                  </div>
                </div>

                {/* Subjects Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Test1</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Test2</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Exam</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Average</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Grade</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                      {canManageMarks && <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {student.subjects.map(result => (
                      <tr key={result.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{result.subject_name}</td>
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
                        {canManageMarks && (
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleEdit(result.id)}
                              style={{ 
                                background: '#2196f3', 
                                color: 'white', 
                                border: 'none', 
                                padding: '5px 10px', 
                                borderRadius: '3px',
                                cursor: 'pointer',
                                marginRight: '5px'
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(result.id)}
                              style={{ 
                                background: '#f44336', 
                                color: 'white', 
                                border: 'none', 
                                padding: '5px 10px', 
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Student Footer Summary */}
                <div style={{ 
                  background: '#e3f2fd', 
                  padding: '10px 15px',
                  display: 'flex',
                  gap: '30px',
                  fontSize: '14px',
                  borderTop: '1px solid #ddd'
                }}>
                  <span><strong>Subjects:</strong> {student.subjects.length}</span>
                  <span><strong>Passed:</strong> {student.subjects.filter(s => s.is_pass).length}</span>
                  <span><strong>Failed:</strong> {student.subjects.filter(s => !s.is_pass).length}</span>
                  <span><strong>Total Marks:</strong> {calculateStudentTotal(student.subjects)}</span>
                  <span><strong>Average:</strong> {calculateStudentAverage(student.subjects)}%</span>
                  <span><strong>GPA:</strong> {calculateStudentGPA(student.subjects)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;