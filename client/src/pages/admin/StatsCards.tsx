import { cn } from '@/lib/cn'
import { formatMoney } from '@/lib/format'
import type { AdminStats } from '@/types/api'

export function StatsCards({ stats }: { stats: AdminStats }) {
  const cards = [
    { label: 'Total bookings', value: String(stats.totalBookings) },
    { label: 'Paid bookings', value: String(stats.paidBookings) },
    { label: 'Revenue', value: formatMoney(stats.revenue), highlight: true },
    { label: 'Upcoming shows', value: String(stats.upcomingShows) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="glass p-5">
          <p className="eyebrow text-neutral-500">{card.label}</p>
          <p className={cn('mt-3 text-3xl font-extrabold tabular-nums', card.highlight ? 'text-accent' : 'text-white')}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
