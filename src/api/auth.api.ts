// src/api/auth.api.ts
import { adminApi } from './axios';

export const adminLogin = async (email: string, password: string) => {
  const response = await adminApi.post('/auth/login', { email, password });
  return response.data; // { success, admin, token }
};

export const adminLogout = async () => {
  await adminApi.post('/auth/logout');
};