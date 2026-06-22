import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;
const baseURL = VITE_API_URL !== undefined && VITE_API_URL !== ''
  ? VITE_API_URL
  : (VITE_API_URL === '' ? '' : 'http://localhost:8080');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token.length > 10) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        return new Promise(() => {});
      }
    }
    return Promise.reject(error);
  }
);

export default api;
