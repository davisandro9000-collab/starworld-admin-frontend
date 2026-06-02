import { adminApi } from './axios';

export const getFlaggedListings = async () => {
  const { data } = await adminApi.get('/tickets/flagged');
  return data;
};

export const removeFlaggedListing = async (id: string, reason: string) => {
  const { data } = await adminApi.post(`/tickets/${id}/remove`, { reason });
  return data;
};