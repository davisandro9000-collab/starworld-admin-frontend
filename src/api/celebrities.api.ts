import { adminApi } from './axios'

export interface AdminCelebrity {
  id: string
  name: string
  slug: string
  bio: string
  imageUrl?: string
  category?: string
  active: boolean
  createdAt: string
}
export type CelebPayload = Omit<AdminCelebrity, 'id' | 'createdAt'>

export async function getAdminCelebrities(): Promise<AdminCelebrity[]> {
  const { data } = await adminApi.get<AdminCelebrity[]>('/admin/celebrities')
  return data
}
export async function createCelebrity(p: CelebPayload): Promise<AdminCelebrity> {
  const { data } = await adminApi.post<AdminCelebrity>('/admin/celebrities', p)
  return data
}
export async function updateCelebrity(id: string, p: Partial<CelebPayload>): Promise<AdminCelebrity> {
  const { data } = await adminApi.patch<AdminCelebrity>(`/admin/celebrities/${id}`, p)
  return data
}
export async function deleteCelebrity(id: string): Promise<void> {
  await adminApi.delete(`/admin/celebrities/${id}`)
}