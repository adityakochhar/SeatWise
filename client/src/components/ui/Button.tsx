import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent font-semibold text-ink shadow-glow hover:bg-accent-strong',
  secondary: 'border border-white/10 bg-white/[0.04] font-medium text-neutral-100 hover:border-white/20 hover:bg-white/[0.08]',
  ghost: 'font-medium text-neutral-300 hover:bg-white/[0.06] hover:text-white',
  danger: 'border border-red-400/30 bg-red-500/10 font-medium text-red-300 hover:bg-red-500/20',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', block = false) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
    'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
    variants[variant],
    sizes[size],
    block && 'w-full',
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  pending?: boolean
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  pending = false,
  block = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(buttonClasses(variant, size, block), className)}
      {...rest}
    >
      {pending && <Spinner size="sm" />}
      {children}
    </button>
  )
}
