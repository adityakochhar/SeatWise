import { cn } from '@/lib/cn'
import { formatMoney } from '@/lib/format'
import type { SeatType, ShowPrices } from '@/types/api'
import { seatClasses, type SeatState } from './Seat'

interface LegendItem {
  label: string
  detail?: string
  state: SeatState
  type: SeatType
}

export function SeatLegend({ prices }: { prices: ShowPrices }) {
  const items: LegendItem[] = [
    { label: 'Available', detail: formatMoney(prices.standard), state: 'available', type: 'standard' },
    { label: 'Premium', detail: formatMoney(prices.premium), state: 'available', type: 'premium' },
    { label: 'Selected', state: 'selected', type: 'standard' },
    { label: 'Held', detail: 'Being booked', state: 'held', type: 'standard' },
    { label: 'Booked', state: 'booked', type: 'standard' },
  ]

  return (
    <ul className="glass flex flex-wrap items-center justify-center gap-x-7 gap-y-3 px-5 py-4">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2.5">
          <span aria-hidden="true" className={cn('pointer-events-none h-5 w-5', seatClasses(item.state, item.type))} />
          <span className="leading-tight">
            <span className="block text-sm text-neutral-200">{item.label}</span>
            {item.detail && <span className="block text-[11px] text-neutral-500">{item.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}
