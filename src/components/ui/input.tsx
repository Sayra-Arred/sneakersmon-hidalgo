import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/s/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-white">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg bg-brand-elevated border border-brand-border px-4 py-3 text-white placeholder:text-brand-muted',
              'focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-brand-error focus:border-brand-error focus:ring-brand-error',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-sm text-brand-error">{error}</p>}
        {hint && !error && <p className="text-sm text-brand-muted">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
