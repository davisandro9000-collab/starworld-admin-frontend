import { useQuery } from '@tanstack/react-query'
import { getOverviewStats } from '../api/analytics.api'

export function useAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: getOverviewStats,
    staleTime: 5 * 60_000,
  })
}