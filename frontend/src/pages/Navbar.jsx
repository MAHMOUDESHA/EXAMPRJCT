import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

const Navbar = () => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  return (
    <nav style={{
      background: 'white',
      padding: '15px 30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
        School System
      </Link>
      <div>
        {authenticated ? (
          <>
            <span style={{ marginRight: '15px', color: '#666' }}>
              Welcome, {user?.username || 'User'}
            </span>
            <Link to="/logout" style={{ color: '#d32f2f' }}>Logout</Link>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '15px', color: '#1976d2' }}>Login</Link>
            <Link to="/register" style={{ color: '#1976d2' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
