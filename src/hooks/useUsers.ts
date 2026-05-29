import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchUsers, getAdminUser, grantCoins, banUser, unbanUser } from '../api/users.api'
import { useAdminNotifStore } from '../stores/adminNotifStore'

export function useUserSearch() {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  function search(val: string) {
    setQ(val)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => setDebounced(val), 300))
  }

  const query = useQuery({
    queryKey: ['admin-users', debounced],
    queryFn: () => searchUsers(debounced),
    enabled: debounced.length >= 2,
  })

  return { q, search, ...query }
}

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => getAdminUser(id!),
    enabled: !!id,
  })
}

export function useGrantCoins() {
  const qc = useQueryClient()
  const push = useAdminNotifStore(s => s.push)
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      grantCoins(id, amount, reason),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin-user', v.id] })
      push({ title: 'Coins granted', body: `${v.amount} coins added.`, variant: 'success' })
    },
  })
}

export function useBanUser() {
  const qc = useQueryClient()
  const push = useAdminNotifStore(s => s.push)
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => banUser(id, reason),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin-user', v.id] })
      push({ title: 'User banned', body: '', variant: 'warning' })
    },
  })
}

export function useUnbanUser() {
  const qc = useQueryClient()
  const push = useAdminNotifStore(s => s.push)
  return useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-user', id] })
      push({ title: 'User unbanned', body: '', variant: 'success' })
    },
  })
}
