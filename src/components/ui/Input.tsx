import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAddon?: string
  rightAddon?: string
}

export default forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-white/50 text-xs mb-1.5">{label}</label>}
      <div className="relative">
        {leftAddon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{leftAddon}</span>}
        <input
          ref={ref}
          className={cn('input-sw', leftAddon && 'pl-8', rightAddon && 'pr-8', error && 'border-loss focus:border-loss', className)}
          {...props}
        />
        {rightAddon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{rightAddon}</span>}
      </div>
      {error && <p className="text-loss text-xs mt-1">{error}</p>}
      {hint && !error && <p className="text-white/30 text-xs mt-1">{hint}</p>}
    </div>
  )
)