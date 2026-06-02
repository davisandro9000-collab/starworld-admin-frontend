import { adminApi } from './axios';

export const getAuditLog = async (params: { userId?: string; action?: string; page?: number }) => {
  const { data } = await adminApi.get('/audit', { params });
  return data;
};