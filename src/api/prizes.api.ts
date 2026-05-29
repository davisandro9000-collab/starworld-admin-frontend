import { adminApi } from './axios'

export interface AdminPrize {
  id: string
  userId: string
  username: string
  email: string
  prizeType: string
  prizeLabel: string
  code: string
  status: 'pending' | 'delivered' | 'failed'
  deliveredAt?: string
  createdAt: string
}

export async function getPendingPrizes(): Promise<AdminPrize[]> {
  const { data } = await adminApi.get<AdminPrize[]>('/admin/prizes?status=pending')
  return data
}
export async function markPrizeDelivered(id: string): Promise<void> {
  await adminApi.post(`/admin/prizes/${id}/deliver`)
}
export async function markPrizeFailed(id: string, reason: string): Promise<void> {
  await adminApi.post(`/admin/prizes/${id}/fail`, { reason })
}
