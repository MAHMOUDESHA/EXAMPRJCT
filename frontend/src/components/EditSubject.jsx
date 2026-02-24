import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.jsx';

const EditSubject = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    code: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const fetchSubject = async () => {
    try {
      const response = await api.get(`/subjects/${id}/`);
      setFormData({
        code: response.data.code || '',
        name: response.data.name || ''
      });
    } catch (error) {
      console.error('Failed to fetch subject', error);
      setError('Failed to load subject data.');
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
      await api.put(`/subjects/${id}/`, formData);
      alert('Subject updated successfully!');
      navigate('/subjects');
    } catch (error) {
      console.error('Failed to update subject', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(errorMessages || 'Failed to update subject. Please try again.');
      } else {
        setError('Failed to update subject. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="content-area">Loading...</div>;

  return (
    <div className="content-area">
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Edit Subject</h1>

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
            <label style={{ display: 'block', marginBottom: '5px' }}>Subject Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Subject Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Subject'}
            </button>
            <button type="button" className="btn" style={{ background: '#f44336', color: 'white' }} onClick={() => navigate('/subjects')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubject;
