import { adminApi } from './axios';

export const getPendingDeposits = async () => {
  const { data } = await adminApi.get('/deposits/pending');
  return data.deposits;
};

export const getPendingCount = async () => {
  const { data } = await adminApi.get('/deposits/pending-count');
  return data.count;
};

export const getDepositHistory = async (params?: { status?: string; page?: number }) => {
  const { data } = await adminApi.get('/deposits/history', { params });
  return data;
};

export const creditDeposit = async (id: string, payload: { coinsAwarded: number }) => {
  const { data } = await adminApi.post(`/deposits/${id}/credit`, payload);
  return data;
};

export const rejectDeposit = async (id: string, payload: { reason: string }) => {
  const { data } = await adminApi.post(`/deposits/${id}/reject`, payload);
  return data;
};