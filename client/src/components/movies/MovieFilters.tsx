import type { ReactNode } from 'react'
import { Chip } from '@/components/ui/Chip'
import { ChevronDownIcon, MapPinIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { DayPicker } from './DayPicker'

// null means "no filter" for that field.
export interface MovieFilterValues {
  city: string | null
  date: string | null
  genre: string | null
  language: string | null
}

export type MovieFilterName = keyof MovieFilterValues

interface PillSelectProps {
  label: string
  icon?: ReactNode
  value: string | null
  allLabel: string
  options: string[]
  onChange: (value: string | null) => void
}

// A native <select> styled as a pill, so the keyboard and mobile pickers keep working.
function PillSelect({ label, icon, value, allLabel, options, onChange }: PillSelectProps) {
  return (
    <div className="relative shrink-0">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">{icon}</span>
      )}
      <select
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className={cn(
          'h-9 appearance-none rounded-full border bg-transparent pr-9 text-sm transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          icon ? 'pl-9' : 'pl-4',
          value ? 'border-accent/50 text-white' : 'border-white/10 text-neutral-300 hover:border-white/20',
        )}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
    </div>
  )
}

interface MovieFiltersProps {
  values: MovieFilterValues
  cities: string[]
  genres: string[]
  languages: string[]
  days: Date[]
  onChange: (name: MovieFilterName, value: string | null) => void
  // Only passed when at least one filter is set, so the button hides itself otherwise.
  onClear?: () => void
  className?: string
}

export function MovieFilters({ values, cities, genres, languages, days, onChange, onClear, className }: MovieFiltersProps) {
  return (
    <div className={cn('glass p-4 sm:p-5', className)}>
      {/* Genres get a full row. Phones scroll it sideways; wider screens wrap it. */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 sm:flex-wrap" role="group" aria-label="Genre">
        <Chip active={values.genre === null} onClick={() => onChange('genre', null)}>
          All
        </Chip>
        {genres.map((genre) => (
          <Chip key={genre} active={values.genre === genre} onClick={() => onChange('genre', genre)}>
            {genre}
          </Chip>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-white/[0.06] pt-4 lg:flex-row lg:items-center lg:justify-between">
        <DayPicker days={days} value={values.date} onChange={(value) => onChange('date', value)} anyDayLabel="Any day" />
        <div className="flex flex-wrap items-center gap-2">
          <PillSelect
            label="City"
            icon={<MapPinIcon className="h-4 w-4" />}
            value={values.city}
            allLabel="All cities"
            options={cities}
            onChange={(value) => onChange('city', value)}
          />
          <PillSelect
            label="Language"
            value={values.language}
            allLabel="All languages"
            options={languages}
            onChange={(value) => onChange('language', value)}
          />
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="px-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
