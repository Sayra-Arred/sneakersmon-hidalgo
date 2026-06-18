import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-elevated text-brand-muted text-xs px-2.5 py-0.5',
        accent: 'bg-brand-accent text-white text-xs px-2.5 py-0.5',
        gold: 'bg-brand-gold text-black text-xs px-2.5 py-0.5',
        success: 'bg-brand-success/20 text-brand-success text-xs px-2.5 py-0.5',
        error: 'bg-brand-error/20 text-brand-error text-xs px-2.5 py-0.5',
        outline: 'border border-brand-border text-brand-muted text-xs px-2.5 py-0.5',
        limited: 'bg-brand-gold text-black text-[10px] px-2 py-0.5 font-black tracking-widest',
        new: 'bg-brand-accent text-white text-[10px] px-2 py-0.5 font-black tracking-widest',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
