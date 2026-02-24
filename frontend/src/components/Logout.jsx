import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '../utils/auth';
import api from '../api/axios';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Try to blacklist the refresh token on the backend
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await api.post('/auth/logout/', { refresh_token: refreshToken });
        }
      } catch (error) {
        // Continue with logout even if backend call fails
        console.log('Backend logout failed, clearing local data');
      } finally {
        // Always clear local auth data
        clearAuthData();
        navigate('/login');
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
