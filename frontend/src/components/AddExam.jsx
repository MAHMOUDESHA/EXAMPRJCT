import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';

const AddExam = () => {
  const [formData, setFormData] = useState({
    name: '',
    term: '',
    year: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/exams/', formData);
      alert('Exam added successfully!');
      navigate('/exams');
    } catch (error) {
      console.error('Failed to add exam', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(errorMessages || 'Failed to add exam. Please try again.');
      } else {
        setError('Failed to add exam. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate year options (current year and 5 years ahead)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  return (
    <div className="content-area">
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Add New Exam</h1>

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
              {loading ? 'Saving...' : 'Save Exam'}
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

export default AddExam;
