import { adminApi } from './axios'

export interface AdminUserDetail {
  id: string
  username: string
  email: string
  tier: 'bronze' | 'silver' | 'platinum'
  coinBalance: number
  banned: boolean
  bannedReason?: string
  emailVerified: boolean
  referralCode: string
  referralCount: number
  payoutUnlocked: boolean
  totalDepositsUsd: number
  totalGamesPlayed: number
  totalGamesWon: number
  createdAt: string
  coinHistory:  Array<{ id: string; amount: number; reason: string; createdAt: string }>
  gameHistory:  Array<{ id: string; gameType: string; won: boolean; coinsEarned: number; createdAt: string }>
  referredUsers: Array<{ id: string; username: string; tier: string; activated: boolean }>
}

export async function searchUsers(q: string, page = 1): Promise<{ users: AdminUserDetail[]; total: number }> {
  const { data } = await adminApi.get('/admin/users', { params: { q, page } })
  return data
}
export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  const { data } = await adminApi.get<AdminUserDetail>(`/admin/users/${id}`)
  return data
}
export async function grantCoins(id: string, amount: number, reason: string): Promise<void> {
  await adminApi.post(`/admin/users/${id}/grant-coins`, { amount, reason })
}
export async function banUser(id: string, reason: string): Promise<void> {
  await adminApi.post(`/admin/users/${id}/ban`, { reason })
}
export async function unbanUser(id: string): Promise<void> {
  await adminApi.post(`/admin/users/${id}/unban`)
}
