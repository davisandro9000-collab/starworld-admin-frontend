// src/api/axios.ts
import axios from 'axios';
import { useAdminAuthStore } from '../stores/adminAuthStore';

const baseURL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001/api/admin/v1';

export const adminApi = axios.create({
  baseURL,
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().adminToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAdminAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);