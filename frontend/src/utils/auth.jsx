// Save user data after login
export const setAuthData = (data) => {
  // Handle both access_token and access key (Django DRF compatibility)
  const token = data.access_token || data.access;
  const refresh = data.refresh_token || data.refresh;
  
  if (token) {
    localStorage.setItem('token', token);
  }
  if (refresh) {
    localStorage.setItem('refresh_token', refresh);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

// Clear auth data on logout
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.user_type || user.role : null;
};

// Get CSRF token from cookie
export const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};
