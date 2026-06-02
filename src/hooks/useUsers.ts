import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchUsers, getUserById, grantCoins, banUser, unbanUser } from '../api/users.api';
import { useAdminNotifStore } from '../stores/adminNotifStore';

export function useUserSearch() {
  const [q, setQ] = React.useState('');
  const query = useQuery({
    queryKey: ['admin-users', q],
    queryFn: () => searchUsers(q),
    enabled: q.length >= 2,
  });
  return {
    q,
    search: (val: string) => setQ(val),
    data: query.data,
    isLoading: query.isLoading,
  };
}

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
  });
}

export function useGrantCoins() {
  const qc = useQueryClient();
  const { push } = useAdminNotifStore();
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      grantCoins(id, amount, reason),
    onSuccess: () => {
      push({ title: 'Coins granted', body: 'Success', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-user'] });
    },
    onError: () => push({ title: 'Grant failed', body: 'Server error', variant: 'error' }),
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  const { push } = useAdminNotifStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => banUser(id, reason),
    onSuccess: () => {
      push({ title: 'User banned', body: '', variant: 'warning' });
      qc.invalidateQueries({ queryKey: ['admin-user'] });
    },
    onError: () => push({ title: 'Ban failed', body: 'Server error', variant: 'error' }),
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  const { push } = useAdminNotifStore();
  return useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: () => {
      push({ title: 'User unbanned', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-user'] });
    },
    onError: () => push({ title: 'Unban failed', body: 'Server error', variant: 'error' }),
  });
}