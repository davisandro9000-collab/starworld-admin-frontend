import { useQuery } from '@tanstack/react-query';
import {
  getAnalyticsOverview,
  getDailyActiveUsers,
  getTotalCoinsIssued,
  getDepositVolume,
  getGameWinRates,
  getTopPerformers,
  getUserRegistrationStats,
  getTierDistribution,
} from '../api/analytics.api';

export function useAnalytics() {
  const overview = useQuery({ queryKey: ['analytics-overview'], queryFn: getAnalyticsOverview });
  const dailyActive = useQuery({ queryKey: ['analytics-daily-active'], queryFn: () => getDailyActiveUsers(30) });
  const coinsIssued = useQuery({ queryKey: ['analytics-coins-issued'], queryFn: () => getTotalCoinsIssued('30d') });
  const depositVolume = useQuery({ queryKey: ['analytics-deposit-volume'], queryFn: () => getDepositVolume('30d') });
  const winRates = useQuery({ queryKey: ['analytics-win-rates'], queryFn: getGameWinRates });
  const topPerformers = useQuery({ queryKey: ['analytics-top-performers'], queryFn: () => getTopPerformers(10) });
  const registrations = useQuery({ queryKey: ['analytics-registrations'], queryFn: () => getUserRegistrationStats(30) });
  const tierDist = useQuery({ queryKey: ['analytics-tier-dist'], queryFn: getTierDistribution });

  const isLoading = overview.isLoading || dailyActive.isLoading || coinsIssued.isLoading || depositVolume.isLoading || winRates.isLoading || topPerformers.isLoading || registrations.isLoading || tierDist.isLoading;
  const error = overview.error || dailyActive.error || coinsIssued.error || depositVolume.error || winRates.error || topPerformers.error || registrations.error || tierDist.error;

  return {
    isLoading,
    error,
    data: {
      totalUsers: overview.data?.totalUsers,
      activeToday: dailyActive.data?.activeToday,
      totalDepositsUsd: depositVolume.data?.totalUsd,
      totalCoinsInCirculation: coinsIssued.data?.totalCoins,
      newUsersLast30: registrations.data?.data,
      depositsByMethod: depositVolume.data?.byMethod || [],
      gameStats: winRates.data?.data,
      tierDistribution: tierDist.data?.data,
    },
  };
}