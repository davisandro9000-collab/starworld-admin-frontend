import { adminApi } from './axios';

export const getPendingPrizes = async () => {
  const { data } = await adminApi.get('/prizes/pending');
  return data;
};

export const getAllPrizes = async () => {
  const { data } = await adminApi.get('/prizes');
  return data.prizes;
};

export const createPrize = async (payload: any) => {
  const { data } = await adminApi.post('/prizes', payload);
  return data.prize;
};

export const updatePrize = async (id: string, payload: any) => {
  const { data } = await adminApi.put(`/prizes/${id}`, payload);
  return data.prize;
};

export const deletePrize = async (id: string) => {
  const { data } = await adminApi.delete(`/prizes/${id}`);
  return data;
};

export const markPrizeDelivered = async (id: string) => {
  const { data } = await adminApi.post(`/prizes/${id}/deliver`);
  return data;
};

export const markPrizeFailed = async (id: string, reason: string) => {
  const { data } = await adminApi.post(`/prizes/${id}/fail`, { reason });
  return data;
};