import axios from 'axios';

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '');
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const envApiBase = import.meta.env.VITE_API_URL ? normalizeBaseUrl(import.meta.env.VITE_API_URL) : '';

// In production, VITE_API_URL must point to your deployed backend (without /api suffix).
const API_URL = envApiBase
  ? `${envApiBase}/api/accounts`
  : (isLocalhost ? 'http://localhost:8000/api/accounts' : 'https://examprjct.onrender.com/api/accounts');

// Get CSRF token from cookie
const getCSRFToken = () => {
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

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for cross-origin requests
});

// Add token and CSRF to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for POST, PUT, DELETE requests
    // First check localStorage (from login response), then check cookie
    let csrfToken = localStorage.getItem('csrf_token');
    if (!csrfToken) {
      csrfToken = getCSRFToken();
    }
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401 errors
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login/') || requestUrl.includes('/auth/token/refresh/');

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token available: return the original 401 response error.
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        }, {
          withCredentials: true
        });

        const { access } = response.data;
        
        localStorage.setItem('token', access);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        processQueue(null, access);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
