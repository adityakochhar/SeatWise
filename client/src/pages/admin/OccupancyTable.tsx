import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatDate, formatTime } from '@/lib/format'
import type { OccupancyRow } from '@/types/api'

// Shows at or above this occupancy get an amber bar.
const nearlyFullPercent = 80

export function OccupancyTable({ rows }: { rows: OccupancyRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="No upcoming shows" description="Add a show to see its occupancy here." />
  }

  return (
    <div className="glass overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider text-neutral-500">
          <tr>
            <th className="px-5 py-3.5 font-medium">Movie</th>
            <th className="px-5 py-3.5 font-medium">Cinema</th>
            <th className="px-5 py-3.5 font-medium">Starts</th>
            <th className="px-5 py-3.5 font-medium">Booked</th>
            <th className="px-5 py-3.5 font-medium">Occupancy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {rows.map((row) => {
            const percent = row.total ? Math.round((row.booked / row.total) * 100) : 0
            return (
              <tr key={row.showId} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 font-medium text-white">{row.movieTitle}</td>
                <td className="px-5 py-3.5 text-neutral-400">{row.cinemaName}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-neutral-400">
                  {formatDate(row.startsAt)}, {formatTime(row.startsAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-neutral-400">
                  {row.booked} / {row.total}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                      <div
                        className={cn('h-full rounded-full', percent >= nearlyFullPercent ? 'bg-amber-400' : 'bg-accent')}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-neutral-300">{percent}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
