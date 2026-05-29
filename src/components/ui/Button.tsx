import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantMap = {
  gold:    'btn-gold',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
  danger:  'btn-danger',
  success: 'btn-success',
}
const sizeMap = { sm: 'text-xs px-3 py-1.5', md: '', lg: 'text-base px-6 py-3' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', size = 'md', loading, disabled, children, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(variantMap[variant], sizeMap[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'