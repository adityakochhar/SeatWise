import { useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchMovie, fetchShows } from '@/api/catalogue'
import { Container } from '@/components/layout/Container'
import { DayPicker } from '@/components/movies/DayPicker'
import { PosterTile } from '@/components/movies/PosterTile'
import { ShowTimeChip } from '@/components/movies/ShowTimeChip'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { ChevronLeftIcon, ClockIcon, MapPinIcon } from '@/components/ui/icons'
import { PageSpinner } from '@/components/ui/Spinner'
import { useQueryParam } from '@/hooks/useQueryParam'
import { dateKey, upcomingDays } from '@/lib/days'
import { formatDuration } from '@/lib/format'
import { keys } from '@/lib/query-keys'
import type { ShowSummary } from '@/types/api'

interface CinemaGroup {
  cinema: ShowSummary['cinema']
  shows: ShowSummary[]
}

function groupByCinema(shows: ShowSummary[]): CinemaGroup[] {
  const groups = new Map<string, CinemaGroup>()
  for (const show of shows) {
    const group = groups.get(show.cinema.id) ?? { cinema: show.cinema, shows: [] }
    group.shows.push(show)
    groups.set(show.cinema.id, group)
  }
  return Array.from(groups.values())
}

function CinemaShows({ group }: { group: CinemaGroup }) {
  return (
    <section className="glass p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">{group.cinema.name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-neutral-400">
          <MapPinIcon className="h-4 w-4" />
          {group.cinema.city}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {group.shows.map((show) => (
          <ShowTimeChip key={show.id} show={show} />
        ))}
      </div>
    </section>
  )
}

export function MoviePage() {
  const { id = '' } = useParams()
  const [dateParam, setDate] = useQueryParam('date')
  const days = useMemo(() => upcomingDays(), [])
  const dayKeys = days.map(dateKey)
  const date = dateParam && dayKeys.includes(dateParam) ? dateParam : dayKeys[0]

  const movie = useQuery({ queryKey: keys.movie(id), queryFn: () => fetchMovie(id) })
  const shows = useQuery({
    queryKey: keys.shows({ movieId: id, date }),
    queryFn: () => fetchShows({ movieId: id, date }),
  })

  if (movie.isPending) return <PageSpinner />
  if (movie.isError) {
    return (
      <Container className="py-8">
        <ErrorMessage error={movie.error} onRetry={movie.refetch} />
      </Container>
    )
  }

  let showtimes: ReactNode
  if (shows.isPending) {
    showtimes = <PageSpinner />
  } else if (shows.isError) {
    showtimes = <ErrorMessage error={shows.error} onRetry={shows.refetch} />
  } else if (shows.data.length === 0) {
    showtimes = <EmptyState title="No shows on this day" description="Try another date." />
  } else {
    showtimes = (
      <div className="space-y-4">
        {groupByCinema(shows.data).map((group) => (
          <CinemaShows key={group.cinema.id} group={group} />
        ))}
      </div>
    )
  }

  const { data } = movie
  return (
    <div className="relative">
      {/* A soft glow in the movie's own colour behind the header. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-32 h-[28rem] opacity-40 blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${data.posterColor}, transparent)` }}
      />

      <Container className="relative py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white">
          <ChevronLeftIcon className="h-4 w-4" />
          All movies
        </Link>

        <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-end">
          <PosterTile
            title={data.title}
            color={data.posterColor}
            size="lg"
            className="w-40 shrink-0 shadow-2xl shadow-black/50 sm:w-52"
          />
          <div className="min-w-0">
            <p className="eyebrow">{data.genres.join(' · ')}</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{data.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
              <Badge>{data.rating}</Badge>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-neutral-500" />
                {formatDuration(data.durationMinutes)}
              </span>
              <span>{data.language}</span>
            </div>
            <p className="mt-4 max-w-2xl leading-relaxed text-neutral-300">{data.description}</p>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">Showtimes</h2>
          <div className="mt-4">
            <DayPicker days={days} value={date} onChange={setDate} />
          </div>
          <div className="mt-6">{showtimes}</div>
        </section>
      </Container>
    </div>
  )
}
