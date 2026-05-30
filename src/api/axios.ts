import axios from 'axios';
import { API_BASE } from '../lib/constants';
import { useAdminAuthStore } from '../stores/adminAuthStore';

export const adminApi = axios.create({
  baseURL: API_BASE,
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