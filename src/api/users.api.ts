import { adminApi } from './axios';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  coinBalance: number;
  tier: { id: string; slug: string; name: string; colorHex: string };
  isBanned: boolean;
  banReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends AdminUser {
  deposits?: any[];
  coinTransactions?: any[];
  totalDepositsUsd?: number;
  totalGamesPlayed?: number;
  totalGamesWon?: number;
  referralCount?: number;
  coinHistory?: { amount: number; reason: string; createdAt: string }[];
  referredUsers?: { id: string; username: string; activated: boolean }[];
}

export async function searchUsers(query: string, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (query) params.append('search', query);
  params.append('page', String(page));
  params.append('limit', String(limit));
  const { data } = await adminApi.get(`/users?${params.toString()}`);
  return data; // { users, total, page, totalPages }
}

export async function getUserById(id: string): Promise<UserDetail> {
  const { data } = await adminApi.get(`/users/${id}`);
  return data.user;
}

export async function grantCoins(userId: string, amount: number, reason: string) {
  const { data } = await adminApi.post(`/users/${userId}/grant-coins`, { amount, reason });
  return data;
}

export async function banUser(userId: string, reason: string) {
  const { data } = await adminApi.post(`/users/${userId}/ban`, { reason });
  return data;
}

export async function unbanUser(userId: string) {
  const { data } = await adminApi.post(`/users/${userId}/unban`);
  return data;
}