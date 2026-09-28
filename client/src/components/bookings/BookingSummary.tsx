import { CalendarIcon, MapPinIcon } from '@/components/ui/icons'
import { formatMoney, formatRelativeDay, formatTime } from '@/lib/format'
import type { BookingView } from '@/types/api'
import { SeatChips } from './SeatChips'
import { TicketTear } from './TicketTear'

export function BookingSummary({ booking }: { booking: BookingView }) {
  const { show } = booking
  return (
    <article className="glass overflow-hidden">
      <div className="p-6">
        <p className="eyebrow">{show.cinema.city}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">{show.movie.title}</h2>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-neutral-500">
              <CalendarIcon className="h-3.5 w-3.5 text-accent" />
              When
            </dt>
            <dd className="mt-1 font-medium text-neutral-100">
              {formatRelativeDay(show.startsAt)}, {formatTime(show.startsAt)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-neutral-500">
              <MapPinIcon className="h-3.5 w-3.5 text-accent" />
              Where
            </dt>
            <dd className="mt-1 font-medium text-neutral-100">
              {show.cinema.name} · {show.screen.name}
            </dd>
          </div>
        </dl>
      </div>

      <TicketTear />

      <dl className="flex items-end justify-between gap-4 p-6">
        <div>
          <dt className="eyebrow text-neutral-500">Seats</dt>
          <dd className="mt-2">
            <SeatChips labels={booking.seatLabels} />
          </dd>
        </div>
        <div className="text-right">
          <dt className="eyebrow text-neutral-500">Total</dt>
          <dd className="mt-1 text-2xl font-extrabold tabular-nums">{formatMoney(booking.amount)}</dd>
        </div>
      </dl>
    </article>
  )
}
