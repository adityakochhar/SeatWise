import { Link } from 'react-router-dom'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { ArrowRightIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { formatDate, formatMoney, formatTime } from '@/lib/format'
import type { BookingStatus, BookingView } from '@/types/api'
import { SeatChips } from './SeatChips'

const tones: Record<BookingStatus, BadgeTone> = {
  pending: 'warning',
  paid: 'success',
  cancelled: 'neutral',
  expired: 'neutral',
}

const labels: Record<BookingStatus, string> = {
  pending: 'Payment pending',
  paid: 'Confirmed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export function BookingCard({ booking }: { booking: BookingView }) {
  const { show } = booking
  const holdActive = booking.status === 'pending' && new Date(booking.expiresAt).getTime() > Date.now()
  const inactive = booking.status === 'cancelled' || booking.status === 'expired'

  return (
    <article className={cn('glass flex flex-col overflow-hidden sm:flex-row', inactive && 'opacity-60')}>
      <div className="flex-1 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={tones[booking.status]}>{labels[booking.status]}</Badge>
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
            {formatDate(show.startsAt)} · {formatTime(show.startsAt)}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-bold">{show.movie.title}</h3>
        <p className="mt-1 text-sm text-neutral-400">
          {show.cinema.name}, {show.cinema.city} · {show.screen.name}
        </p>
        <div className="mt-3">
          <SeatChips labels={booking.seatLabels} />
        </div>
        {holdActive && (
          <Link
            to={`/checkout/${booking.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            Complete payment
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* The ticket stub: amount, and the code once paid. */}
      <dl className="flex items-end justify-between gap-4 border-t border-dashed border-white/15 p-5 sm:w-52 sm:flex-col sm:items-start sm:justify-center sm:border-l sm:border-t-0">
        <div>
          <dt className="eyebrow text-neutral-500">Amount</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums">{formatMoney(booking.amount)}</dd>
        </div>
        {booking.code && (
          <div>
            <dt className="eyebrow text-neutral-500">Ticket code</dt>
            <dd className="mt-1 font-mono text-lg font-semibold tracking-[0.2em] text-accent">{booking.code}</dd>
          </div>
        )}
      </dl>
    </article>
  )
}
