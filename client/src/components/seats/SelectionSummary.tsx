import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { ArrowRightIcon, CloseIcon } from '@/components/ui/icons'
import { formatMoney } from '@/lib/format'
import type { SeatView, ShowPrices } from '@/types/api'

interface SelectionSummaryProps {
  seats: SeatView[]
  prices: ShowPrices
  maxSeats: number
  pending: boolean
  error: string | null
  needsLogin: boolean
  onRemove: (seat: SeatView) => void
  onHold: () => void
}

function priceOf(seat: SeatView, prices: ShowPrices): number {
  return seat.type === 'premium' ? prices.premium : prices.standard
}

function buttonLabel(count: number, needsLogin: boolean): string {
  if (count === 0) return 'Pick your seats'
  if (needsLogin) return 'Log in to continue'
  return `Hold ${count} ${count === 1 ? 'seat' : 'seats'}`
}

export function SelectionSummary({
  seats,
  prices,
  maxSeats,
  pending,
  error,
  needsLogin,
  onRemove,
  onHold,
}: SelectionSummaryProps) {
  const total = seats.reduce((sum, seat) => sum + priceOf(seat, prices), 0)

  return (
    // On phones this sticks to the bottom of the screen; on large screens it sits beside the map.
    <aside className="glass sticky bottom-3 z-10 mt-4 bg-ink/85 p-4 lg:bottom-auto lg:top-24 lg:mt-0 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="eyebrow">Your selection</h2>
        <span className="font-mono text-[11px] text-neutral-500">
          {seats.length} / {maxSeats}
        </span>
      </div>

      {seats.length === 0 && (
        <p className="mt-3 text-sm text-neutral-400">Tap seats on the map to add them. You can pick up to {maxSeats}.</p>
      )}

      {seats.length > 0 && (
        <>
          {/* Phones get a one-line summary to keep the sticky bar short. */}
          <p className="mt-2 truncate font-mono text-sm text-neutral-300 lg:hidden">
            {seats.map((seat) => seat.label).join(', ')}
          </p>
          <ul className="mt-4 hidden space-y-2 lg:block">
            {seats.map((seat) => (
              <li key={seat.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 font-mono text-xs font-semibold text-accent">
                  {seat.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium capitalize text-neutral-100">{seat.type}</span>
                  <span className="block text-xs text-neutral-500">
                    Row {seat.row}, seat {seat.number}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{formatMoney(priceOf(seat, prices))}</span>
                <button
                  type="button"
                  onClick={() => onRemove(seat)}
                  aria-label={`Remove seat ${seat.label}`}
                  className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-4 flex items-end justify-between border-t border-white/[0.08] pt-4">
        <span className="text-sm text-neutral-400">Total</span>
        <span className="text-2xl font-extrabold tabular-nums text-accent lg:text-3xl">{formatMoney(total)}</span>
      </div>

      {error && <ErrorMessage message={error} className="mt-3" />}

      <Button block size="lg" pending={pending} disabled={seats.length === 0} onClick={onHold} className="mt-4">
        {buttonLabel(seats.length, needsLogin)}
        {seats.length > 0 && <ArrowRightIcon className="h-4 w-4" />}
      </Button>
      <p className="mt-3 hidden text-center text-xs text-neutral-500 lg:block">
        Seats are held for 5 minutes once you continue.
      </p>
    </aside>
  )
}
