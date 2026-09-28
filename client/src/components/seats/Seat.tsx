import { HourglassIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import type { SeatType, SeatView } from '@/types/api'

export type SeatState = 'available' | 'selected' | 'held' | 'booked'

const stateClasses: Record<SeatState, string> = {
  available: 'border-white/15 text-neutral-400 hover:border-accent hover:bg-accent/10 hover:text-accent',
  selected: 'border-accent bg-accent font-bold text-ink shadow-glow',
  held: 'cursor-not-allowed border-dashed border-indigo-400/60 bg-indigo-400/10 text-indigo-300',
  booked: 'cursor-not-allowed border-transparent bg-white/[0.06] text-neutral-600',
}

// Premium seats only look different while they are free. Once taken they look like any other seat.
const premiumAvailable = 'border-amber-400/50 text-amber-200/80 hover:border-accent hover:bg-accent/10 hover:text-accent'

// Shared with SeatLegend, so the key always matches the map.
export function seatClasses(state: SeatState, type: SeatType) {
  return cn(
    'border transition-colors',
    type === 'premium' ? 'rounded-b-md rounded-t-lg' : 'rounded-md',
    state === 'available' && type === 'premium' ? premiumAvailable : stateClasses[state],
  )
}

interface SeatProps {
  seat: SeatView
  state: SeatState
  onToggle: (seat: SeatView) => void
}

export function Seat({ seat, state, onToggle }: SeatProps) {
  const disabled = state === 'held' || state === 'booked'
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={state === 'selected'}
      aria-label={`Seat ${seat.label}, ${seat.type}, ${state}`}
      title={seat.label}
      onClick={() => onToggle(seat)}
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-medium md:h-9 md:w-9 md:text-xs',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        seatClasses(state, seat.type),
      )}
    >
      {state === 'held' ? <HourglassIcon className="h-3 w-3 md:h-3.5 md:w-3.5" /> : seat.number}
    </button>
  )
}
