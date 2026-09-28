import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/format'
import type { ShowSummary } from '@/types/api'

// Below this share of free seats a show is marked "Only N left".
const fillingFastShare = 0.25

export function ShowTimeChip({ show }: { show: ShowSummary }) {
  const soldOut = show.availableSeats === 0
  const started = new Date(show.startsAt).getTime() < Date.now()
  const shareLeft = show.totalSeats ? show.availableSeats / show.totalSeats : 0
  const fillingFast = !soldOut && shareLeft < fillingFastShare

  let availability = `${show.availableSeats} seats left`
  if (soldOut) availability = 'Sold out'
  else if (started) availability = 'Started'
  else if (fillingFast) availability = `Only ${show.availableSeats} left`

  const body = (
    <>
      <span className="block text-base font-bold">{formatTime(show.startsAt)}</span>
      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        {show.screen.name}
      </span>
      <span className="mt-2.5 block h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <span
          className={cn('block h-full rounded-full', fillingFast ? 'bg-amber-400' : 'bg-accent')}
          style={{ width: `${Math.round(shareLeft * 100)}%` }}
        />
      </span>
      <span className={cn('mt-1.5 block text-[11px]', fillingFast ? 'text-amber-300' : 'text-neutral-400')}>
        {availability}
      </span>
    </>
  )

  const base = 'block w-36 rounded-xl border px-3.5 py-3 text-left transition-colors'

  if (soldOut || started) {
    return (
      <span aria-disabled="true" className={cn(base, 'cursor-not-allowed border-white/5 bg-white/[0.02] text-neutral-600')}>
        {body}
      </span>
    )
  }

  return (
    <Link
      to={`/shows/${show.id}`}
      className={cn(base, 'border-white/10 bg-white/[0.03] text-white hover:border-accent/50 hover:bg-accent/[0.06]')}
    >
      {body}
    </Link>
  )
}
