import { adminApi } from './axios'

export interface OverviewStats {
  totalUsers: number
  activeToday: number
  totalDepositsUsd: number
  totalCoinsInCirculation: number
  newUsersLast30: Array<{ date: string; count: number }>
  depositsByMethod: Array<{ method: string; totalUsd: number; count: number }>
  tierDistribution: { bronze: number; silver: number; platinum: number }
  gameStats: Array<{ gameType: string; timesPlayed: number; winRate: number; coinsAwarded: number }>
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const { data } = await adminApi.get<OverviewStats>('/admin/analytics/overview')
  return data
}