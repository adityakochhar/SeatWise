import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

// A pill-shaped on/off button, used for filters like genre.
export function chipClasses(active: boolean) {
  return cn(
    'inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    active ? 'border-accent bg-accent text-ink' : 'border-white/10 text-neutral-300 hover:border-white/20 hover:text-white',
  )
}

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean
}

export function Chip({ active, className, type = 'button', ...rest }: ChipProps) {
  return <button type={type} aria-pressed={active} className={cn(chipClasses(active), className)} {...rest} />
}
