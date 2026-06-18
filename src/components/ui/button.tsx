'use client'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand-accent text-white hover:bg-[#e04d18] active:scale-[0.98] shadow-glow-accent/0 hover:shadow-glow-accent/50',
        secondary: 'bg-brand-elevated text-white border border-brand-border hover:border-brand-accent hover:text-brand-accent',
        outline: 'border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white',
        ghost: 'text-brand-muted hover:text-white hover:bg-brand-elevated',
        gold: 'bg-brand-gold text-black hover:bg-[#c4a230] font-bold shadow-glow-gold/0 hover:shadow-glow-gold/50',
        danger: 'bg-brand-error text-white hover:bg-red-600',
        link: 'text-brand-accent hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
)
Button.displayName = 'Button'

export { buttonVariants }
