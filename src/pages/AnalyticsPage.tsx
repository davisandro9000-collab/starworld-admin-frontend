// src/pages/AnalyticsPage.tsx

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { PageHeader, EmptyState } from '../components/ui/adminHelpers'
import { useAnalytics } from '../hooks/useAnalytics'

const AXIS_STYLE = { fill: 'rgba(255,255,255,0.3)', fontSize: 11 }
const TOOLTIP_STYLE = {
  backgroundColor: '#13172B',
  border: '1px solid #1E2440',
  borderRadius: 8,
  fontSize: 12,
  color: '#fff',
}

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) {
    return (
      <div className="admin-page flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!data) return <div className="admin-page"><EmptyState icon="📊" message="No analytics data available" /></div>

  const totalUsers = (data.tierDistribution?.bronze ?? 0)
    + (data.tierDistribution?.silver ?? 0)
    + (data.tierDistribution?.platinum ?? 0)

  return (
    <div className="admin-page flex flex-col gap-8">
      <PageHeader title="Analytics" subtitle="Platform overview and trends" />

      {/* Row 1 — stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users"           value={data.totalUsers?.toLocaleString() ?? '—'} />
        <StatCard label="Active Today"           value={data.activeToday?.toLocaleString() ?? '—'} />
        <StatCard label="Total Deposits"         value={`$${data.totalDepositsUsd?.toLocaleString() ?? '0'}`} />
        <StatCard label="Coins in Circulation"   value={(data.totalCoinsInCirculation ?? 0).toLocaleString()} />
      </div>

      {/* Row 2 — charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <p className="font-heading font-semibold text-white text-sm mb-4">New Users — Last 30 Days</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.newUsersLast30 ?? []}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: 'rgba(255,215,0,0.2)' }} />
              <Line type="monotone" dataKey="count" stroke="#FFD700" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FFD700' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="font-heading font-semibold text-white text-sm mb-4">Deposits by Method (USD)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.depositsByMethod ?? []}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis dataKey="method" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,215,0,0.05)' }} />
              <Bar dataKey="totalUsd" fill="#FFD700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 — game stats + tier distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <p className="font-heading font-semibold text-white text-sm mb-4">Game Statistics</p>
          <table className="w-full">
            <thead>
              <tr>
                {['Game Type', 'Played', 'Win Rate', 'Coins Awarded'].map(h => (
                  <th key={h} className="font-body text-white/30 text-xs font-medium text-left pb-2 border-b border-sw-border pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.gameStats ?? []).map((g: any) => (
                <tr key={g.gameType} className="border-b border-sw-border/30 last:border-0">
                  <td className="py-2.5 font-heading font-semibold text-white text-sm capitalize pr-4">{g.gameType}</td>
                  <td className="py-2.5 font-body text-white/60 text-sm pr-4">{g.timesPlayed?.toLocaleString()}</td>
                  <td className="py-2.5 font-body text-cyan text-sm pr-4">{(g.winRate * 100).toFixed(1)}%</td>
                  <td className="py-2.5">
                    <span className="coin-chip text-xs"><span className="coin-dot" />{g.coinsAwarded?.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <p className="font-heading font-semibold text-white text-sm mb-4">Tier Distribution</p>
          <div className="flex flex-col gap-4">
            {(['bronze', 'silver', 'platinum'] as const).map(tier => {
              const count = data.tierDistribution?.[tier] ?? 0
              const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0
              return (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant={tier} />
                    <span className="font-body text-white/50 text-xs">{count.toLocaleString()} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
