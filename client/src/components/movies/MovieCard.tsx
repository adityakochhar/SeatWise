import { Link } from 'react-router-dom'
import { formatDuration } from '@/lib/format'
import type { Movie } from '@/types/api'
import { PosterTile } from './PosterTile'

interface MovieCardProps {
  movie: Movie
  // Number of shows matching the current filters. Left out for movies with nothing scheduled.
  showCount?: number
}

export function MovieCard({ movie, showCount }: MovieCardProps) {
  const bookable = showCount !== undefined && showCount > 0

  return (
    <Link to={`/movies/${movie.id}`} className="group block rounded-xl focus:outline-none">
      <PosterTile
        title={movie.title}
        color={movie.posterColor}
        className="transition duration-300 group-hover:-translate-y-1 group-hover:ring-accent/40 group-focus-visible:ring-2 group-focus-visible:ring-accent"
      >
        <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 font-mono text-[11px] font-medium text-white ring-1 ring-white/15 backdrop-blur">
          {movie.rating}
        </span>
        {bookable && (
          <span className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-0.5 font-mono text-[11px] text-accent ring-1 ring-accent/30 backdrop-blur">
            {showCount} {showCount === 1 ? 'show' : 'shows'}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <h3 className="text-base font-bold leading-snug text-white">{movie.title}</h3>
          <p className="mt-1 truncate text-xs text-neutral-300">{movie.genres.join(' · ')}</p>
        </div>
      </PosterTile>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs text-neutral-400">
          {formatDuration(movie.durationMinutes)} · {movie.language}
        </p>
        <span className="shrink-0 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold text-accent transition-colors group-hover:bg-accent group-hover:text-ink">
          {bookable ? 'Book' : 'Details'}
        </span>
      </div>
    </Link>
  )
}

// Grey placeholder with the same shape as a card, shown while movies load.
export function MovieCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.05]" />
      <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-white/[0.05]" />
    </div>
  )
}
