// src/pages/TiersPage.tsx

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/axios'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { PageHeader } from '../components/ui/adminHelpers'

const getTierDistribution = () => adminApi.get('/admin/tiers/distribution').then(r => r.data)

const TIER_META = {
  bronze: {
    winRate: '30%',
    multiplier: '1×',
    entry: 'Default tier — all new users',
    color: '#CD7F32',
  },
  silver: {
    winRate: '50%',
    multiplier: '1.5×',
    entry: '$5 deposit + 3 activated referrals',
    color: '#C0C0C0',
  },
  platinum: {
    winRate: '75%',
    multiplier: '2×',
    entry: '$10 deposit — no referrals needed',
    color: '#E5E4E2',
  },
} as const

export default function TiersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tiers'],
    queryFn: getTierDistribution,
    staleTime: 60_000,
  })

  const total = data
    ? (data.bronze ?? 0) + (data.silver ?? 0) + (data.platinum ?? 0)
    : 0

  return (
    <div className="admin-page">
      <PageHeader
        title="Tier Distribution"
        subtitle="Read-only view. Tier upgrades are automatic — triggered by deposits and referrals."
      />

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="md" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['bronze', 'silver', 'platinum'] as const).map(tier => {
            const count = data?.[tier] ?? 0
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
            const meta = TIER_META[tier]

            return (
              <div
                key={tier}
                className="card p-6 flex flex-col gap-4"
                style={{ borderTopColor: meta.color, borderTopWidth: 2 }}
              >
                <div className="flex items-center justify-between">
                  <Badge variant={tier} />
                  <span className="font-heading font-black text-3xl text-white">
                    {count.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, backgroundColor: meta.color }}
                    />
                  </div>
                  <p className="font-body text-white/40 text-xs">{pct}% of all users</p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-sw-border">
                  <MetaRow label="Win Rate"   value={meta.winRate} />
                  <MetaRow label="Coin Bonus" value={meta.multiplier} />
                  <MetaRow label="Entry"      value={meta.entry} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 card p-4 flex items-center gap-3">
        <span className="text-gold text-lg">⚠</span>
        <p className="font-body text-white/40 text-sm">
          Tier upgrades are <strong className="text-white/70">one-way and automatic</strong>.
          They are triggered server-side after a deposit is credited or a referral is activated.
          Admins cannot manually change a user's tier — use "Grant Coins" on the Users page for compensation.
        </p>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-body text-white/30 text-xs">{label}</span>
      <span className="font-body text-white/70 text-xs">{value}</span>
    </div>
  )
}
