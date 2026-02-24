import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';

const AddSubject = () => {
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/subjects/', formData);
      navigate('/subjects');
    } catch (error) {
      console.error('Failed to add subject', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-area">
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Add New Subject</h1>

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
              {loading ? 'Saving...' : 'Save Subject'}
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

export default AddSubject;
