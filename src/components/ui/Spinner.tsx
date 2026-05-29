import { cn } from '../../lib/utils'
const sizeMap2 = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-8 h-8' }
export default function Spinner({ size = 'md', className }: { size?: 'sm'|'md'|'lg'; className?: string }) {
  return <span className={cn('inline-block rounded-full border-2 border-t-gold border-sw-border animate-spin', sizeMap2[size], className)} />
}