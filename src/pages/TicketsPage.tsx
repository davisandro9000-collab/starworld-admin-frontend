// src/pages/TicketsPage.tsx

import { useState } from 'react'
import { format } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/axios'
import { Button } from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Input from '../components/ui/Input'
import { PageHeader, EmptyState, ConfirmModal } from '../components/ui/adminHelpers'
import { useAdminNotifStore } from '../stores/adminNotifStore'

const getFlaggedListings = () => adminApi.get('/admin/tickets/flagged').then(r => r.data)
const removeListing = (id: string, reason: string) =>
  adminApi.post(`/admin/tickets/${id}/remove`, { reason }).then(r => r.data)

export default function TicketsPage() {
  const { push } = useAdminNotifStore()
  const qc = useQueryClient()
  const [removeTarget, setRemoveTarget] = useState<any>(null)
  const [reason, setReason] = useState('')

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['admin-flagged-tickets'],
    queryFn: getFlaggedListings,
  })

  const removeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => removeListing(id, reason),
    onSuccess: () => {
      push({ title: 'Listing removed', body: reason, variant: 'info' })
      qc.invalidateQueries({ queryKey: ['admin-flagged-tickets'] })
      setRemoveTarget(null); setReason('')
    },
    onError: () => push({ title: 'Remove failed', body: 'Server error', variant: 'error' }),
  })

  return (
    <div className="admin-page">
      <PageHeader title="Flagged Tickets" subtitle="Review and remove flagged marketplace listings" />

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="md" /></div>
      ) : listings.length === 0 ? (
        <EmptyState icon="🎟" message="No flagged listings" />
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                {['Event', 'Seller', 'Listed', 'Flag Reason', 'Actions'].map(h => (
                  <th key={h} className="font-body text-white/40 text-xs font-medium text-left px-3 py-2 border-b border-sw-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l: any) => (
                <tr key={l.id} className="border-b border-sw-border/40 hover:bg-sw-card-2 transition-colors">
                  <td className="px-3 py-3 font-heading font-semibold text-white text-sm">{l.ticketName}</td>
                  <td className="px-3 py-3 font-body text-white/60 text-sm">{l.seller?.username}</td>
                  <td className="px-3 py-3 font-body text-white/40 text-xs">{format(new Date(l.createdAt), 'MMM d, HH:mm')}</td>
                  <td className="px-3 py-3 font-body text-loss text-xs">{l.flagReason}</td>
                  <td className="px-3 py-3">
                    <Button variant="danger" onClick={() => { setRemoveTarget(l); setReason('') }}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeMutation.mutate({ id: removeTarget.id, reason })}
        title="Remove Listing"
        body={`Remove "${removeTarget?.ticketName}" from the marketplace?`}
        confirmLabel="Remove"
        variant="danger"
        loading={removeMutation.isPending}
      >
        <Input label="Reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Fraudulent listing" />
      </ConfirmModal>
    </div>
  )
}
