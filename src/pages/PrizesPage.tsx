// src/pages/PrizesPage.tsx

import { useState } from 'react'
import { format } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { PageHeader, EmptyState, CopyBlock } from '../components/ui/adminHelpers'
import { getPendingPrizes, markPrizeDelivered, markPrizeFailed } from '../api/prizes.api'
import { useAdminNotifStore } from '../stores/adminNotifStore'

export default function PrizesPage() {
  const { push } = useAdminNotifStore()
  const qc = useQueryClient()
  const [failId, setFailId] = useState<string | null>(null)
  const [failReason, setFailReason] = useState('')

  const { data: prizes = [], isLoading } = useQuery({
    queryKey: ['admin-prizes'],
    queryFn: getPendingPrizes,
    refetchInterval: 60_000,
  })

  const deliverMutation = useMutation({
    mutationFn: (id: string) => markPrizeDelivered(id),
    onSuccess: () => {
      push({ title: 'Prize marked delivered', body: '', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['admin-prizes'] })
    },
    onError: () => push({ title: 'Failed', body: 'Server error', variant: 'error' }),
  })

  const failMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => markPrizeFailed(id, reason),
    onSuccess: () => {
      push({ title: 'Prize marked failed', body: failReason, variant: 'warning' })
      qc.invalidateQueries({ queryKey: ['admin-prizes'] })
      setFailId(null)
      setFailReason('')
    },
    onError: () => push({ title: 'Failed', body: 'Server error', variant: 'error' }),
  })

  return (
    <div className="admin-page">
      <PageHeader title="Prizes" subtitle="Fulfill pending prize claims" />

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="md" /></div>
      ) : prizes.length === 0 ? (
        <EmptyState icon="✅" message="All prizes fulfilled — nothing pending" />
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                {['User', 'Prize Type', 'Prize', 'Code', 'Claimed', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="font-body text-white/40 text-xs font-medium text-left px-3 py-2 border-b border-sw-border"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prizes.map((p: any) => (
                <tr key={p.id} className="border-b border-sw-border/40 hover:bg-sw-card-2 transition-colors">
                  <td className="px-3 py-3 font-body text-white text-sm">{p.user?.username}</td>
                  <td className="px-3 py-3"><Badge variant="pending" /></td>
                  <td className="px-3 py-3 font-body text-white/70 text-sm">{p.prizeLabel}</td>
                  <td className="px-3 py-3"><CopyBlock value={p.code} /></td>
                  <td className="px-3 py-3 font-body text-white/40 text-xs">
                    {format(new Date(p.createdAt), 'MMM d, HH:mm')}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        onClick={() => deliverMutation.mutate(p.id)}
                        loading={deliverMutation.isPending}
                      >
                        Delivered
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => { setFailId(p.id); setFailReason('') }}
                      >
                        Failed
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!failId} onClose={() => setFailId(null)} title="Mark Prize Failed">
        <div className="flex flex-col gap-4">
          <Input
            label="Reason"
            value={failReason}
            onChange={e => setFailReason(e.target.value)}
            placeholder="e.g. Invalid code, delivery failed"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setFailId(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => failMutation.mutate({ id: failId!, reason: failReason })}
              loading={failMutation.isPending}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
