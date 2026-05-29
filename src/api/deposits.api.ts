import { adminApi } from './axios'

export type DepositStatus = 'pending' | 'credited' | 'rejected'
export type DepositMethod = 'BTC' | 'ETH' | 'USDT_TRC20' | 'BNB' | 'amazon' | 'google_play' | 'apple' | 'steam'

export interface AdminDeposit {
  id: string
  userId: string
  username: string
  email: string
  userTier: 'bronze' | 'silver' | 'platinum'
  userCoinBalance: number
  method: DepositMethod
  txHash?: string
  giftCardDigits?: string
  amountUsd?: number
  coinsAwarded?: number
  status: DepositStatus
  processedBy?: string
  processedAt?: string
  rejectionReason?: string
  createdAt: string
}

export interface CreditPayload  { coinsAwarded: number }
export interface RejectPayload  { reason: string }

export async function getPendingDeposits(): Promise<AdminDeposit[]> {
  const { data } = await adminApi.get<AdminDeposit[]>('/admin/deposits/pending')
  return data
}
export async function getPendingCount(): Promise<{ count: number }> {
  const { data } = await adminApi.get<{ count: number }>('/admin/deposits/pending-count')
  return data
}
export async function getDepositHistory(params?: { status?: string; page?: number }): Promise<{ deposits: AdminDeposit[]; total: number }> {
  const { data } = await adminApi.get('/admin/deposits', { params })
  return data
}
export async function creditDeposit(id: string, payload: CreditPayload): Promise<void> {
  await adminApi.post(`/admin/deposits/${id}/credit`, payload)
}
export async function rejectDeposit(id: string, payload: RejectPayload): Promise<void> {
  await adminApi.post(`/admin/deposits/${id}/reject`, payload)
}
