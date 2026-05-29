import { cn } from '../../lib/utils'

type BadgeVariant = 'pending'|'credited'|'rejected'|'banned'|'active'|'bronze'|'silver'|'platinum'

const varMap: Record<BadgeVariant, string> = {
  pending:  'badge-pending',
  credited: 'badge-credited',
  rejected: 'badge-rejected',
  banned:   'badge-banned',
  active:   'badge-active',
  bronze:   'badge-bronze',
  silver:   'badge-silver',
  platinum: 'badge-platinum',
}

export default function Badge({ variant, children, className }: { variant: BadgeVariant; children?: React.ReactNode; className?: string }) {
  return <span className={cn(varMap[variant], className)}>{children ?? variant}</span>
}