import { adminApi } from './axios';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const adminLogin = async (email: string, password: string) => {
  const response = await adminApi.post('/auth/login', { email, password });
  return response.data; // { success, admin, token }
};

export const adminLogout = async () => {
  await adminApi.post('/auth/logout');
};

export const adminGetMe = async (): Promise<AdminUser> => {
  const response = await adminApi.get('/auth/me');
  return response.data;
};