import { cn } from '@/lib/cn'
import type { SeatView } from '@/types/api'
import { ScreenLine } from './ScreenLine'
import { Seat, type SeatState } from './Seat'

interface SeatMapProps {
  seats: SeatView[]
  selectedIds: Set<string>
  onToggle: (seat: SeatView) => void
}

function groupByRow(seats: SeatView[]): Array<[string, SeatView[]]> {
  const rows = new Map<string, SeatView[]>()
  for (const seat of seats) {
    const row = rows.get(seat.row) ?? []
    row.push(seat)
    rows.set(seat.row, row)
  }
  return Array.from(rows.entries())
}

function stateFor(seat: SeatView, selectedIds: Set<string>): SeatState {
  if (seat.status !== 'available') return seat.status
  return selectedIds.has(seat.id) ? 'selected' : 'available'
}

function RowLabel({ row, premium }: { row: string; premium: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn('w-5 shrink-0 text-center font-mono text-[11px]', premium ? 'text-amber-300/70' : 'text-neutral-600')}
    >
      {row}
    </span>
  )
}

export function SeatMap({ seats, selectedIds, onToggle }: SeatMapProps) {
  const rows = groupByRow(seats)
  const premiumRows = rows.filter(([, rowSeats]) => rowSeats[0].type === 'premium').map(([row]) => row)

  return (
    <div className="glass px-4 py-8 md:px-8">
      <ScreenLine />

      {/* Wide screens scroll sideways on phones instead of squashing the seats. */}
      <div className="mt-10 overflow-x-auto pb-2">
        <div className="mx-auto w-max space-y-2">
          {rows.map(([row, rowSeats]) => {
            const premium = rowSeats[0].type === 'premium'
            return (
              <div key={row} className="flex items-center gap-1.5 md:gap-2">
                <RowLabel row={row} premium={premium} />
                {rowSeats.map((seat) => (
                  <Seat key={seat.id} seat={seat} state={stateFor(seat, selectedIds)} onToggle={onToggle} />
                ))}
                <RowLabel row={row} premium={premium} />
              </div>
            )
          })}
        </div>
      </div>

      {premiumRows.length > 0 && (
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          <span className="text-amber-300/80">Premium</span> · rows {premiumRows.join(', ')}
        </p>
      )}
    </div>
  )
}
