import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.jsx';

const EditExam = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    term: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const response = await api.get(`/exams/${id}/`);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to fetch exam', error);
      setError('Failed to load exam data.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/exams/${id}/`, formData);
      alert('Exam updated successfully!');
      navigate('/exams');
    } catch (error) {
      console.error('Failed to update exam', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(errorMessages || 'Failed to update exam. Please try again.');
      } else {
        setError('Failed to update exam. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  if (initialLoading) return <div className="content-area">Loading...</div>;

  return (
    <div className="content-area">
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Edit Exam</h1>

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

      <div className="card" style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Exam Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Term</label>
            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            >
              <option value="">Select Term</option>
              <option value="1">Term I</option>
              <option value="2">Term II</option>
              <option value="3">Term III</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Exam'}
            </button>
            <button type="button" className="btn" style={{ background: '#f44336', color: 'white' }} onClick={() => navigate('/exams')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExam;
