// src/pages/NotificationsPage.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDistanceToNow } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { PageHeader, EmptyState } from '../components/ui/adminHelpers'
import { broadcastNotification, getRecentBroadcasts } from '../api/notifications.api'
import type { BroadcastPayload } from '../api/notifications.api'
import { useAdminNotifStore } from '../stores/adminNotifStore'

const ACCENT_PRESETS = [
  { label: 'Gold',     color: '#FFD700' },
  { label: 'Cyan',     color: '#00E5FF' },
  { label: 'Bronze',   color: '#CD7F32' },
  { label: 'Silver',   color: '#C0C0C0' },
  { label: 'Platinum', color: '#E5E4E2' },
]

const schema = z.object({
  title:        z.string().min(1, 'Required').max(60),
  body:         z.string().min(1, 'Required').max(200),
  priority:     z.enum(['high', 'normal', 'low']),
  target:       z.enum(['all', 'bronze', 'silver', 'platinum', 'user']),
  targetUserId: z.string().optional(),
  ctaLabel:     z.string().max(30).optional(),
  ctaUrl:       z.string().url('Must be a valid URL').optional().or(z.literal('')),
  accentColor:  z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const PRIORITY_OPTIONS = [
  { value: 'high',   label: 'High',   desc: 'Modal overlay — blocks UI until dismissed' },
  { value: 'normal', label: 'Normal', desc: 'Toast notification, auto-dismissed after 8s' },
  { value: 'low',    label: 'Low',    desc: 'Silent — only increments bell badge' },
]

export default function NotificationsPage() {
  const { push } = useAdminNotifStore()
  const qc = useQueryClient()
  const [accentColor, setAccentColor] = useState('#FFD700')

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'normal', target: 'all', accentColor: '#FFD700' },
  })

  const watchAll = watch()
  const target = watch('target')

  const { data: recent = [], isLoading: recentLoading } = useQuery({
    queryKey: ['admin-broadcasts'],
    queryFn: getRecentBroadcasts,
    staleTime: 30_000,
  })

  const mutation = useMutation({
    mutationFn: broadcastNotification,
    onSuccess: () => {
      push({ title: 'Broadcast sent', body: watchAll.title ?? '', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['admin-broadcasts'] })
      reset()
      setAccentColor('#FFD700')
    },
    onError: () => push({ title: 'Broadcast failed', body: 'Server error', variant: 'error' }),
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate({ ...values, accentColor } as BroadcastPayload)
  }

  return (
    <div className="admin-page">
      <PageHeader
        title="Notifications"
        subtitle="Broadcast notifications to users by tier or individually"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* ── Compose form ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 flex flex-col gap-5">
          <p className="font-heading font-bold text-white text-base">Compose Broadcast</p>

          <Input
            label="Title"
            error={errors.title?.message}
            {...register('title')}
            placeholder="e.g. Weekend Bonus Coins!"
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-white/70 text-sm">Body</label>
            <textarea
              className={cn('input-sw min-h-[80px] resize-none', errors.body && 'border-loss')}
              placeholder="Notification message…"
              {...register('body')}
            />
            {errors.body && <p className="font-body text-loss text-xs">{errors.body.message}</p>}
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <label className="font-body text-white/70 text-sm">Priority</label>
            <div className="flex flex-col gap-2">
              {PRIORITY_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    watchAll.priority === opt.value
                      ? 'border-gold/40 bg-gold/5'
                      : 'border-sw-border hover:border-sw-border-2'
                  )}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('priority')}
                    className="mt-0.5 accent-[#FFD700]"
                  />
                  <div>
                    <p className="font-heading font-semibold text-white text-sm">{opt.label}</p>
                    <p className="font-body text-white/40 text-xs">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-white/70 text-sm">Target audience</label>
            <select className="input-sw" {...register('target')}>
              <option value="all">All users</option>
              <option value="bronze">Bronze tier</option>
              <option value="silver">Silver tier</option>
              <option value="platinum">Platinum tier</option>
              <option value="user">Specific user</option>
            </select>
          </div>
          {target === 'user' && (
            <Input
              label="Username or User ID"
              error={errors.targetUserId?.message}
              {...register('targetUserId')}
            />
          )}

          {/* Optional CTA */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="CTA label (optional)" placeholder="e.g. Claim Now" {...register('ctaLabel')} />
            <Input
              label="CTA URL (optional)"
              placeholder="https://…"
              error={errors.ctaUrl?.message}
              {...register('ctaUrl')}
            />
          </div>

          {/* Accent colour */}
          <div className="flex flex-col gap-2">
            <label className="font-body text-white/70 text-sm">Accent colour</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_PRESETS.map(p => (
                <button
                  type="button"
                  key={p.color}
                  onClick={() => setAccentColor(p.color)}
                  title={p.label}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    accentColor === p.color ? 'border-white scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: p.color }}
                />
              ))}
              <input
                type="text"
                className="input-sw w-28 text-xs font-mono"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                placeholder="#FFD700"
              />
            </div>
          </div>

          <Button type="submit" variant="gold" loading={mutation.isPending} className="mt-2">
            Send Broadcast
          </Button>
        </form>

        {/* ── Live preview ── */}
        <div className="flex flex-col gap-3">
          <p className="font-body text-white/40 text-xs uppercase tracking-wider">Live Preview</p>
          <div
            className="card p-4 relative overflow-hidden"
            style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
          >
            <div
              className="absolute bottom-0 left-0 h-[2px] w-1/2"
              style={{ backgroundColor: accentColor }}
            />
            <p className="font-heading font-bold text-white text-sm">
              {watchAll.title || 'Notification title…'}
            </p>
            <p className="font-body text-white/50 text-xs mt-1">
              {watchAll.body || 'Notification body text will appear here.'}
            </p>
            {watchAll.ctaLabel && (
              <span className="inline-block mt-3 text-xs font-heading font-semibold btn-outline px-3 py-1">
                {watchAll.ctaLabel}
              </span>
            )}
          </div>
          <p className="font-body text-white/30 text-xs">
            {watchAll.priority === 'high' && '⚡ This will appear as a modal overlay'}
            {watchAll.priority === 'normal' && '🔔 This will slide in as a toast from top-right'}
            {watchAll.priority === 'low' && '🔕 This will only increment the bell badge silently'}
          </p>
        </div>
      </div>

      {/* ── Recent broadcasts ── */}
      <p className="font-heading font-bold text-white text-base mb-4">Recent Broadcasts</p>
      {recentLoading ? (
        <div className="flex justify-center pt-8"><Spinner size="md" /></div>
      ) : recent.length === 0 ? (
        <EmptyState icon="📢" message="No broadcasts sent yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                {['Title', 'Target', 'Priority', 'Sent', 'By'].map(h => (
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
              {recent.map((b: any) => (
                <tr key={b.id} className="border-b border-sw-border/40 hover:bg-sw-card-2 transition-colors">
                  <td className="px-3 py-3 font-body text-white text-sm">{b.title}</td>
                  <td className="px-3 py-3">
                    <Badge variant={b.target === 'all' ? 'active' : b.target} />
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        b.priority === 'high' ? 'active'
                        : b.priority === 'normal' ? 'pending'
                        : 'rejected'
                      }
                    />
                  </td>
                  <td className="px-3 py-3 font-body text-white/40 text-xs">
                    {formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-3 py-3 font-body text-white/50 text-sm">{b.admin?.username ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
