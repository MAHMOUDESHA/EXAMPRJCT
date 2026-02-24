import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.jsx';

const EditStudent = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    registration_number: '',
    full_name: '',
    current_class: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await api.get(`/students/${id}/`);
      setFormData({
        registration_number: response.data.registration_number || '',
        full_name: response.data.full_name || '',
        current_class: response.data.current_class || ''
      });
    } catch (error) {
      console.error('Failed to fetch student', error);
      setError('Failed to load student data.');
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
      await api.put(`/students/${id}/`, formData);
      alert('Student updated successfully!');
      navigate('/students');
    } catch (error) {
      console.error('Failed to update student', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(errorMessages || 'Failed to update student. Please try again.');
      } else {
        setError('Failed to update student. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="content-area">Loading...</div>;

  return (
    <div className="content-area">
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Edit Student</h1>

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

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Registration Number</label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Class</label>
            <select
              name="current_class"
              value={formData.current_class}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            >
              <option value="">Select Class</option>
              <option value="Form 1">Form 1</option>
              <option value="Form 2">Form 2</option>
              <option value="Form 3">Form 3</option>
              <option value="Form 4">Form 4</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Student'}
            </button>
            <button type="button" className="btn" style={{ background: '#f44336', color: 'white' }} onClick={() => navigate('/students')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;
