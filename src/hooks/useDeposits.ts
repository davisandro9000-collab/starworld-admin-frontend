import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPendingDeposits, getPendingCount, getDepositHistory, creditDeposit, rejectDeposit } from '../api/deposits.api'
import { useAdminNotifStore } from '../stores/adminNotifStore'

export function usePendingDeposits() {
  return useQuery({
    queryKey: ['admin-deposits-pending'],
    queryFn: getPendingDeposits,
    refetchInterval: 30_000,
  })
}

export function usePendingCount() {
  return useQuery({
    queryKey: ['admin-deposits-pending-count'],
    queryFn: getPendingCount,
    refetchInterval: 60_000,
  })
}

export function useDepositHistory(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin-deposits-history', params],
    queryFn: () => getDepositHistory(params),
    staleTime: 60_000,
  })
}

export function useCreditDeposit() {
  const qc = useQueryClient()
  const push = useAdminNotifStore(s => s.push)
  return useMutation({
    mutationFn: ({ id, coins }: { id: string; coins: number }) =>
      creditDeposit(id, { coinsToAward: coins }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-deposits-pending'] })
      qc.invalidateQueries({ queryKey: ['admin-deposits-pending-count'] })
      push({ title: 'Deposit credited', body: 'Coins granted to user.', variant: 'success' })
    },
    onError: () => push({ title: 'Failed', body: 'Could not credit deposit.', variant: 'error' }),
  })
}

export function useRejectDeposit() {
  const qc = useQueryClient()
  const push = useAdminNotifStore(s => s.push)
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectDeposit(id, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-deposits-pending'] })
      qc.invalidateQueries({ queryKey: ['admin-deposits-pending-count'] })
      push({ title: 'Deposit rejected', body: 'User has been notified.', variant: 'info' })
    },
    onError: () => push({ title: 'Failed', body: 'Could not reject deposit.', variant: 'error' }),
  })
}