import { useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { fetchCities, fetchMovies, fetchShows } from '@/api/catalogue'
import { Container } from '@/components/layout/Container'
import { MovieCard, MovieCardSkeleton } from '@/components/movies/MovieCard'
import { MovieFilters, type MovieFilterName, type MovieFilterValues } from '@/components/movies/MovieFilters'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useQueryParam } from '@/hooks/useQueryParam'
import { dateKey, upcomingDays } from '@/lib/days'
import { formatRelativeDay } from '@/lib/format'
import { keys } from '@/lib/query-keys'
import type { Movie, ShowSummary } from '@/types/api'

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort()
}

// How many shows each movie has in the current results, keyed by movie id.
function countShowsByMovie(shows: ShowSummary[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const show of shows) {
    counts.set(show.movie.id, (counts.get(show.movie.id) ?? 0) + 1)
  }
  return counts
}

function MovieGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{children}</div>
}

function SectionHeading({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {detail && <p className="text-sm text-neutral-500">{detail}</p>}
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [city, setCity] = useQueryParam('city')
  const [dateParam, setDate] = useQueryParam('date')
  const [genre, setGenre] = useQueryParam('genre')
  const [language, setLanguage] = useQueryParam('language')

  const days = useMemo(() => upcomingDays(), [])
  // A date in the URL only counts if it is one of the days we offer.
  const selectedDay = days.find((day) => dateKey(day) === dateParam)
  const date = selectedDay ? dateKey(selectedDay) : null

  // City and date are filtered by the API. Genre and language are filtered below, in the browser.
  const showFilters = { city: city ?? undefined, date: date ?? undefined }
  const cities = useQuery({ queryKey: keys.cities, queryFn: fetchCities })
  const movies = useQuery({ queryKey: keys.movies, queryFn: fetchMovies })
  const shows = useQuery({ queryKey: keys.shows(showFilters), queryFn: () => fetchShows(showFilters) })

  const filters: MovieFilterValues = { city, date, genre, language }
  const hasFilters = Object.values(filters).some((value) => value !== null)
  const setters = { city: setCity, date: setDate, genre: setGenre, language: setLanguage }

  function changeFilter(name: MovieFilterName, value: string | null) {
    setters[name](value)
  }

  function clearFilters() {
    navigate({ search: '' }, { replace: true })
  }

  const catalogue = movies.data ?? []
  const showCounts = countShowsByMovie(shows.data ?? [])
  const matchesGenreAndLanguage = (movie: Movie) =>
    (!genre || movie.genres.includes(genre)) && (!language || movie.language === language)

  const nowShowing = catalogue.filter((movie) => showCounts.has(movie.id) && matchesGenreAndLanguage(movie))
  // Movies with no upcoming shows anywhere. Only meaningful when no city or date is picked.
  const notScheduled =
    city || date ? [] : catalogue.filter((movie) => !showCounts.has(movie.id) && matchesGenreAndLanguage(movie))

  const loaded = movies.isSuccess && shows.isSuccess
  const summary = `${nowShowing.length} ${nowShowing.length === 1 ? 'film' : 'films'} · ${city ?? 'All cities'} · ${
    selectedDay ? formatRelativeDay(selectedDay) : 'Any day'
  }`

  let results: ReactNode
  if (movies.isPending || shows.isPending) {
    results = (
      <>
        <p role="status" className="sr-only">
          Loading movies
        </p>
        <MovieGrid>
          {Array.from({ length: 6 }, (_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </MovieGrid>
      </>
    )
  } else if (movies.isError || shows.isError) {
    results = (
      <ErrorMessage
        error={movies.error ?? shows.error}
        onRetry={() => {
          movies.refetch()
          shows.refetch()
        }}
      />
    )
  } else if (nowShowing.length === 0) {
    results = (
      <EmptyState
        title="Nothing showing here"
        description={hasFilters ? 'Try another day, city or genre.' : 'No upcoming shows have been scheduled yet.'}
        action={
          hasFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          )
        }
      />
    )
  } else {
    results = (
      <MovieGrid>
        {nowShowing.map((movie) => (
          <MovieCard key={movie.id} movie={movie} showCount={showCounts.get(movie.id)} />
        ))}
      </MovieGrid>
    )
  }

  return (
    <Container className="py-10 sm:py-14">
      <header>
        <p className="eyebrow">Live seat booking</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Pick a film. <span className="text-gradient">Pick your seat.</span>
        </h1>
        <p className="mt-5 max-w-xl text-neutral-400">
          Seats update live as other people book. Hold up to six for five minutes while you pay.
        </p>
      </header>

      <MovieFilters
        className="mt-10"
        values={filters}
        cities={cities.data ?? []}
        genres={uniqueSorted(catalogue.flatMap((movie) => movie.genres))}
        languages={uniqueSorted(catalogue.map((movie) => movie.language))}
        days={days}
        onChange={changeFilter}
        onClear={hasFilters ? clearFilters : undefined}
      />

      <section className="mt-12">
        <SectionHeading title="Now showing" detail={loaded ? summary : undefined} />
        {results}
      </section>

      {notScheduled.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Not scheduled yet" detail="In the catalogue, with no upcoming shows" />
          <MovieGrid>
            {notScheduled.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </MovieGrid>
        </section>
      )}
    </Container>
  )
}
