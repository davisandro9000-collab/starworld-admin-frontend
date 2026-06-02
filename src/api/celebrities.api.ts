import { adminApi } from './axios';

export interface Celebrity {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  genre?: string;
  isPublished: boolean;
  createdAt: string;
}

export type CelebPayload = {
  name: string;
  slug: string;
  bio?: string;
  imageUrl?: string;
  category?: string;
  active: boolean;
};

export const getAdminCelebrities = async (): Promise<Celebrity[]> => {
  const { data } = await adminApi.get('/celebrities');
  return data.celebrities;
};

export const createCelebrity = async (payload: CelebPayload) => {
  const { data } = await adminApi.post('/celebrities', payload);
  return data.celebrity;
};

export const updateCelebrity = async (id: string, payload: Partial<CelebPayload>) => {
  const { data } = await adminApi.put(`/celebrities/${id}`, payload);
  return data.celebrity;
};

export const deleteCelebrity = async (id: string) => {
  const { data } = await adminApi.delete(`/celebrities/${id}`);
  return data;
};