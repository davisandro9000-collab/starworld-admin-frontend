// src/pages/AuditLogPage.tsx

import { useState } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import Spinner from '../components/ui/Spinner'
import Input from '../components/ui/Input'
import { PageHeader, EmptyState, TablePagination } from '../components/ui/adminHelpers'
import { getAuditLog } from '../api/audit.api'

const PAGE_SIZE = 20

const ADMIN_ACTIONS = [
  'all',
  'deposit.credit',
  'deposit.reject',
  'user.grant_coins',
  'user.ban',
  'user.unban',
  'notification.broadcast',
  'prize.delivered',
  'prize.failed',
  'celebrity.create',
  'celebrity.update',
  'celebrity.delete',
  'ticket.remove',
]

export default function AuditLogPage() {
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('all')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', userId, action, page],
    queryFn: () => getAuditLog({
      userId: userId || undefined,
      action: action === 'all' ? undefined : action,
      page,
    }),
    staleTime: 30_000,
  })

  // API returns { entries, total } — compute totalPages locally
  const logs = data?.entries ?? []
  const totalPages = data?.total ? Math.ceil(data.total / PAGE_SIZE) : 1

  return (
    <div className="admin-page">
      <PageHeader title="Audit Log" subtitle="All admin actions, immutable" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="w-48">
          <Input
            placeholder="Filter by user ID"
            value={userId}
            onChange={e => { setUserId(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input-sw"
          value={action}
          onChange={e => { setAction(e.target.value); setPage(1) }}
        >
          {ADMIN_ACTIONS.map(a => (
            <option key={a} value={a}>{a === 'all' ? 'All actions' : a}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="md" /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon="📋" message="No audit entries match your filters" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  {['Timestamp', 'Admin', 'Action', 'Target User', 'Details'].map(h => (
                    <th key={h} className="font-body text-white/40 text-xs font-medium text-left px-3 py-2 border-b border-sw-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <>
                    <tr
                      key={log.id}
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      className="border-b border-sw-border/40 hover:bg-sw-card-2 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-3 font-mono text-white/50 text-xs whitespace-nowrap">
                        {format(new Date(log.createdAt), 'MMM d HH:mm:ss')}
                      </td>
                      <td className="px-3 py-3 font-body text-white/70 text-sm">{log.admin?.username ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs bg-sw-bg border border-sw-border px-2 py-0.5 rounded text-cyan">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-body text-white/50 text-sm">{log.targetUser?.username ?? '—'}</td>
                      <td className="px-3 py-3 font-body text-white/30 text-xs">
                        {expandedId === log.id ? '▲ collapse' : '▼ expand'}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr key={`${log.id}-detail`} className="border-b border-sw-border/40 bg-sw-bg">
                        <td colSpan={5} className="px-4 py-3">
                          <pre className="font-mono text-xs text-white/60 whitespace-pre-wrap overflow-x-auto max-h-40">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  )
}
