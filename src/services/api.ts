import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let lastNetworkToast = 0;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError =
      !error.response &&
      (error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        error.message === 'Network Error' ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('network')));

    if (isNetworkError) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      const now = Date.now();
      if (now - lastNetworkToast > 5000) {
        lastNetworkToast = now;
        toast.error('سرور در دسترس نیست. لطفاً اتصال شبکه یا وضعیت سرور را بررسی کنید.');
      }
    }

    return Promise.reject(error);
  },
);
