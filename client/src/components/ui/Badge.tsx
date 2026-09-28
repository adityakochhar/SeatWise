import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-white/[0.06] text-neutral-300 ring-white/10',
  success: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
  warning: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
  danger: 'bg-red-400/10 text-red-300 ring-red-400/25',
  accent: 'bg-accent/10 text-accent ring-accent/25',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider ring-1 ring-inset',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
