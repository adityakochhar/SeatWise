import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

export function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-300">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  )
}

export function controlClasses(error?: string, className?: string) {
  return cn(
    'block w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600',
    'transition-colors focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/20',
    'disabled:cursor-not-allowed disabled:opacity-50',
    error ? 'border-red-400/60' : 'border-white/10 hover:border-white/20',
    className,
  )
}
