import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type PosterSize = 'sm' | 'md' | 'lg'

const initialsSizes: Record<PosterSize, string> = {
  sm: 'text-sm',
  md: 'text-5xl',
  lg: 'text-6xl',
}

interface PosterTileProps {
  title: string
  color: string
  size?: PosterSize
  className?: string
  // Anything laid over the poster, like the title or a badge.
  children?: ReactNode
}

function initials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join('')
}

function isDark(hex: string): boolean {
  const value = hex.replace('#', '')
  if (value.length !== 6) return true
  const red = parseInt(value.slice(0, 2), 16)
  const green = parseInt(value.slice(2, 4), 16)
  const blue = parseInt(value.slice(4, 6), 16)
  return red * 0.299 + green * 0.587 + blue * 0.114 < 150
}

// Movies have a colour instead of a poster image. The colour fades into the page
// background, so white text laid over the bottom of the tile is always readable.
export function PosterTile({ title, color, size = 'md', className, children }: PosterTileProps) {
  return (
    <div
      className={cn('relative aspect-[2/3] overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-inset ring-white/10', className)}
      style={{ backgroundImage: `linear-gradient(170deg, ${color} 0%, ${color}80 45%, #070B0C 100%)` }}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 font-extrabold tracking-tight',
          initialsSizes[size],
        )}
        style={{ color: isDark(color) ? 'rgb(255 255 255 / 0.3)' : 'rgb(0 0 0 / 0.3)' }}
      >
        {initials(title)}
      </span>
      {children}
    </div>
  )
}
