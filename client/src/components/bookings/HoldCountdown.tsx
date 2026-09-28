import { HourglassIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { formatCountdown } from '@/lib/format'

export function HoldCountdown({ remainingMs }: { remainingMs: number }) {
  // Turn red in the last minute.
  const urgent = remainingMs <= 60_000
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border p-4',
        urgent ? 'border-red-400/30 bg-red-500/10' : 'border-accent/25 bg-accent/[0.06]',
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-full',
          urgent ? 'bg-red-400/15 text-red-300' : 'bg-accent/15 text-accent',
        )}
      >
        <HourglassIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-neutral-100">Your seats are on hold</p>
        <p className="hidden text-sm text-neutral-400 sm:block">They go back on sale when the timer runs out.</p>
      </div>
      <span
        className={cn('font-mono text-3xl font-semibold tabular-nums', urgent ? 'text-red-300' : 'text-accent')}
        aria-live="polite"
      >
        {formatCountdown(remainingMs)}
      </span>
    </div>
  )
}
