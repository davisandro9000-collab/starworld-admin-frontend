import { adminApi } from './axios'

export interface AuditEntry {
  id: string
  adminId: string
  adminUsername: string
  action: string
  targetUserId?: string
  targetUsername?: string
  metadata: Record<string, unknown>
  createdAt: string
}

export async function getAuditLog(params?: { userId?: string; action?: string; page?: number }): Promise<{ entries: AuditEntry[]; total: number }> {
  const { data } = await adminApi.get('/admin/audit', { params })
  return data
}
