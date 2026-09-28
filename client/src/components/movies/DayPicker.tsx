import { cn } from '@/lib/cn'
import { dateKey } from '@/lib/days'
import { formatDate, formatWeekday } from '@/lib/format'

interface DayPickerProps {
  days: Date[]
  // The selected day as YYYY-MM-DD, or null for "any day".
  value: string | null
  onChange: (value: string | null) => void
  // When given, adds a first button that clears the day, e.g. "Any day".
  anyDayLabel?: string
}

function dayClasses(active: boolean) {
  return cn(
    'flex h-14 min-w-[3.5rem] shrink-0 flex-col items-center justify-center rounded-xl border px-3 transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    active ? 'border-accent bg-accent text-ink shadow-glow' : 'border-white/10 text-neutral-300 hover:border-white/25 hover:text-white',
  )
}

export function DayPicker({ days, value, onChange, anyDayLabel }: DayPickerProps) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1" role="group" aria-label="Choose a date">
      {anyDayLabel && (
        <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={dayClasses(value === null)}>
          <span className="text-sm font-semibold">{anyDayLabel}</span>
        </button>
      )}
      {days.map((day, index) => {
        const key = dateKey(day)
        const active = key === value
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            aria-label={formatDate(day)}
            onClick={() => onChange(key)}
            className={dayClasses(active)}
          >
            <span className={cn('font-mono text-[10px] uppercase tracking-wider', active ? 'text-ink/70' : 'text-neutral-500')}>
              {index === 0 ? 'Today' : formatWeekday(day)}
            </span>
            <span className="mt-0.5 text-lg font-bold leading-none">{day.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}
