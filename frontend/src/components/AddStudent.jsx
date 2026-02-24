import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    registration_number: '',
    full_name: '',
    current_class: '',
    username: '',
    password: '',
    email: '',
    phone_number: ''
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
      // The RegisterSerializer already creates both user and student profile
      // So we just need to call the registration endpoint
      const nameParts = formData.full_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: firstName,
        last_name: lastName,
        user_type: 'student',
        phone_number: formData.phone_number
      };
      
      await api.post('/auth/register/', userData);
      
      // Show success and redirect
      alert('Student added successfully!');
      navigate('/students');
    } catch (error) {
      console.error('Failed to add student', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(errorMessages || 'Failed to add student. Please try again.');
      } else {
        setError('Failed to add student. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-area">
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Add New Student</h1>

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

          <h3 style={{ color: '#1976d2', margin: '20px 0 10px' }}>Account Information</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number (Optional)</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Student'}
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

export default AddStudent;
