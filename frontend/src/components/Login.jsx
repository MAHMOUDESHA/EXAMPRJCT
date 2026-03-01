import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.jsx';
import { setAuthData, getUserRole, clearAuthData } from '../utils/auth';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '', login_as: 'auto' });
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
      // Warm backend before login (helps with Render cold starts).
      try {
        await api.get('/auth/csrf/');
      } catch {
        // Ignore warmup errors; login retry loop below handles transient failures.
      }

      let response;
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await api.post('/auth/login/', formData);
          break;
        } catch (attemptError) {
          lastError = attemptError;
          const isNetworkIssue = attemptError?.request && !attemptError?.response;
          const isTimeout = attemptError?.code === 'ECONNABORTED';
          const shouldRetry = (isNetworkIssue || isTimeout) && attempt < 3;
          if (shouldRetry) {
            await wait(2000 * attempt);
            continue;
          }
          throw attemptError;
        }
      }

      if (!response) {
        throw lastError || new Error('Login failed');
      }

      setAuthData(response.data);
      
      // Get user role and redirect accordingly
      const role = getUserRole();
      if (formData.login_as !== 'auto' && role !== formData.login_as) {
        clearAuthData();
        setError(`This account is not ${formData.login_as}. Please use the correct login option.`);
        return;
      }

      if (role === 'teacher') {
        navigate('/dashboard');
      } else if (role === 'student') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Server is waking up. Please wait 10-20 seconds and try again.');
        return;
      }
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Login As</label>
            <select
              name="login_as"
              value={formData.login_as}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="auto">Auto Detect</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
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
