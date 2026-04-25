import axios from 'axios';

/**
 * Normalize VITE_API_URL so we never double-prefix `/api`.
 * Endpoints use paths like `/api/auth/login`; base should be origin only
 * (e.g. http://localhost:5000 or https://service.onrender.com), not .../api.
 */
function normalizeApiBase(url) {
  let base = (url || '').trim();
  if (!base) return '';
  base = base.replace(/\/+$/, '');
  base = base.replace(/\/api$/i, '');
  return base;
}

const rawBase = normalizeApiBase(import.meta.env.VITE_API_URL || '');

/**
 * Central Axios instance. In local dev, leave VITE_API_URL empty so requests
 * use same-origin `/api/...` and the Vite dev proxy forwards to the backend.
 * In production, set VITE_API_URL to the API host only (no trailing /api).
 */
const apiClient = axios.create({
  baseURL: rawBase.length > 0 ? rawBase : '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('easyshop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthEntry = url.includes('/auth/login') || url.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthEntry) {
      localStorage.removeItem('easyshop_token');
      localStorage.removeItem('easyshop_shopName');
    }
    return Promise.reject(err);
  }
);

export default apiClient;
