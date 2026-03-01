import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.jsx';
import { setAuthData, getUserRole } from '../utils/auth';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
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
      const response = await api.post('/auth/login/', formData);
      setAuthData(response.data);
      
      // Get user role and redirect accordingly
      const role = getUserRole();
      if (role === 'teacher') {
        navigate('/dashboard');
      } else if (role === 'student') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        const data = error.response.data || {};
        const fieldError = data.username?.[0] || data.password?.[0];
        const nonFieldError = data.non_field_errors?.[0];
        const detailError = data.detail;

        if (error.response.status === 401) {
          setError(detailError || 'Invalid username or password');
        } else if (error.response.status === 400) {
          setError(fieldError || nonFieldError || detailError || 'Please provide both username and password');
        } else {
          setError('Login failed. Please try again.');
        }
      } else if (error.request) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(error?.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ color: '#1976d2', textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', background: '#ffebee', borderRadius: '5px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
          
          <div style={{ marginBottom: '20px' }}>
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
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Don't have account? <Link to="/register" style={{ color: '#1976d2' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
