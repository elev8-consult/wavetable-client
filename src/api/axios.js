import axios from 'axios';

const envBaseUrl = process.env.REACT_APP_API_URL?.trim();

let normalizedBaseUrl = 'http://localhost:5001/api';
if (envBaseUrl) {
  // Allow providing either full API base path or just the origin; default to appending /api for the latter.
  const sanitized = envBaseUrl.replace(/\/$/, '');
  const hasPathBeyondRoot = /^https?:\/\//i.test(sanitized)
    ? sanitized.replace(/^https?:\/\/[^/]+/, '').length > 0
    : sanitized.includes('/');
  normalizedBaseUrl = hasPathBeyondRoot ? sanitized : `${sanitized}/api`;
}

const api = axios.create({
  baseURL: normalizedBaseUrl,
});

// Add JWT token to headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: ignore 304, handle 401 centrally
api.interceptors.response.use(
  response => {
    // pass through successful responses (including 200 and 304)
    return response;
  },
  error => {
    if (error && error.response) {
      const status = error.response.status;
      // do not treat 304 as an error here
      if (status === 304) {
        return Promise.resolve(error.response);
      }
      if (status === 401) {
        console.warn('API 401 received — clearing token and redirecting to login');
        try { localStorage.removeItem('token'); } catch (e) {}
        // Avoid importing react-router here; use location to redirect
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
