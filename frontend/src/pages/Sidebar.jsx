import React from 'react';
import { NavLink } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

const Sidebar = () => {
  const user = getCurrentUser();

  const getLinks = () => {
    if (!user) return [];

    switch (user.user_type) {
      case 'admin':
        return [
          { to: '/dashboard', label: '📊 Dashboard' },
          { to: '/students', label: '👥 Students' },
          { to: '/add-student', label: '➕ Add Student' },
          { to: '/subjects', label: '📚 Subjects' },
          { to: '/add-subject', label: '➕ Add Subject' },
          { to: '/exams', label: '📝 Exams' },
          { to: '/add-exam', label: '➕ Add Exam' },
          { to: '/results', label: '📋 Results' },
        ];
      case 'teacher':
        return [
          { to: '/dashboard', label: '📊 Dashboard' },
          { to: '/enter-marks', label: '✏️ Enter Marks' },
          { to: '/results', label: '📋 Manage Marks' },
        ];
      case 'student':
        return [
          { to: '/dashboard', label: '📊 Dashboard' },
          { to: '/results', label: '📋 My Results' },
        ];
      default:
        return [];
    }
  };

  return (
    <aside style={{
      width: '250px',
      background: 'white',
      boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
      padding: '20px 0',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #ddd' }}>
        <h3 style={{ color: '#1976d2' }}>Menu</h3>
      </div>
      <nav style={{ padding: '20px 0' }}>
        {getLinks().map((link, index) => (
          <NavLink
            key={index}
            to={link.to}
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              color: isActive ? 'white' : '#333',
              backgroundColor: isActive ? '#1976d2' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s'
            })}
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink
          to="/logout"
          style={({ isActive }) => ({
            display: 'block',
            padding: '12px 20px',
            color: isActive ? 'white' : '#d32f2f',
            backgroundColor: isActive ? '#d32f2f' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.3s',
            marginTop: 'auto',
            borderTop: '1px solid #ddd'
          })}
        >
          🚪 Logout
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
