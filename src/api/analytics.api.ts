import { adminApi } from './axios';

export async function getAnalyticsOverview() {
  const { data } = await adminApi.get('/analytics/overview');
  return data;
}

export async function getDailyActiveUsers(days = 30) {
  const { data } = await adminApi.get(`/analytics/daily-active-users?days=${days}`);
  return data;
}

export async function getTotalCoinsIssued(period = '30d') {
  const { data } = await adminApi.get(`/analytics/total-coins-issued?period=${period}`);
  return data;
}

export async function getDepositVolume(period = '30d') {
  const { data } = await adminApi.get(`/analytics/deposit-volume?period=${period}`);
  return data;
}

export async function getGameWinRates() {
  const { data } = await adminApi.get('/analytics/game-win-rates');
  return data;
}

export async function getTopPerformers(limit = 10) {
  const { data } = await adminApi.get(`/analytics/top-performers?limit=${limit}`);
  return data;
}

export async function getUserRegistrationStats(days = 30) {
  const { data } = await adminApi.get(`/analytics/user-registration-stats?days=${days}`);
  return data;
}

export async function getTierDistribution() {
  const { data } = await adminApi.get('/analytics/tier-distribution');
  return data;
}