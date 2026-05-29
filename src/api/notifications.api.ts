import { adminApi } from './axios'

export interface BroadcastPayload {
  title: string
  body: string
  priority: 'high' | 'normal' | 'low'
  target: 'all' | 'bronze' | 'silver' | 'platinum' | 'user'
  targetUserId?: string
  ctaLabel?: string
  ctaUrl?: string
  accentColor?: string
}
export interface BroadcastRecord extends BroadcastPayload {
  id: string
  sentBy: string
  createdAt: string
}

export async function broadcastNotification(payload: BroadcastPayload): Promise<void> {
  await adminApi.post('/admin/notifications/broadcast', payload)
}
export async function getRecentBroadcasts(): Promise<BroadcastRecord[]> {
  const { data } = await adminApi.get<BroadcastRecord[]>('/admin/notifications/broadcasts')
  return data
}
