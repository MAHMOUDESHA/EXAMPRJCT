import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',  // Added password confirmation
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'student',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const navigate = useNavigate();

  // Countdown timer for redirect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      navigate('/login');
    }
  }, [success, countdown, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if passwords match
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register/', formData);
      // Registration successful, show success message
      setSuccess(true);
    } catch (error) {
      if (error.response && error.response.data) {
        // Format error messages from backend
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(errorMessages || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again. Make sure the backend server is running.');
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#e3f2fd',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '30px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
{success ? (
          <div style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✓</div>
            <h3 style={{ margin: '0 0 10px 0' }}>Registration Successful!</h3>
            <p style={{ margin: 0 }}>Redirecting to login in {countdown} seconds...</p>
          </div>
        ) : (
          <>
        <h2 style={{ color: '#1976d2', textAlign: 'center', marginBottom: '20px' }}>
          Create Account
        </h2>
        
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#1976d2' }}>
              I am a
            </label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#1976d2' }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#1976d2' }}>
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#1976d2' }}>
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
                required
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#1976d2' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#1976d2' }}>
              Phone Number
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#1976d2' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#1976d2' }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', color: '#666' }}>
          Already have an account?{' '}
<Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Login
          </Link>
        </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
