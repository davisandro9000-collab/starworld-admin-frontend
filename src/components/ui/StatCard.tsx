interface StatCardProps {
  label: string; value: string | number
  delta?: string; deltaUp?: boolean; icon?: string; className?: string
}
export default function StatCard({ label, value, delta, deltaUp, icon, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <span className="stat-label">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <span className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      {delta && <span className={deltaUp ? 'stat-delta-up' : 'stat-delta-down'}>{deltaUp ? '↑' : '↓'} {delta}</span>}
    </div>
  )
}