import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { holdSeats } from '@/api/bookings'
import { fetchShow, fetchShowSeats } from '@/api/catalogue'
import { ApiError, errorMessage } from '@/api/client'
import { useAuth } from '@/auth/useAuth'
import { Container } from '@/components/layout/Container'
import { SeatLegend } from '@/components/seats/SeatLegend'
import { SeatMap } from '@/components/seats/SeatMap'
import { SelectionSummary } from '@/components/seats/SelectionSummary'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { PageSpinner } from '@/components/ui/Spinner'
import { dateKey } from '@/lib/days'
import { formatDuration, formatRelativeDay, formatTime } from '@/lib/format'
import { keys } from '@/lib/query-keys'
import { useShowSeatsLive } from '@/realtime/useShowSeatsLive'
import type { SeatView } from '@/types/api'

const maxSeats = 6

function unavailableLabels(details: unknown): string[] {
  if (typeof details !== 'object' || details === null || !('unavailable' in details)) return []
  const { unavailable } = details
  if (!Array.isArray(unavailable)) return []
  return unavailable.filter((label): label is string => typeof label === 'string')
}

function holdErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    const taken = unavailableLabels(error.details)
    if (taken.length) return `Some seats were just taken: ${taken.join(', ')}. Please pick different seats.`
  }
  return errorMessage(error)
}

export function SeatSelectionPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  const show = useQuery({ queryKey: keys.show(id), queryFn: () => fetchShow(id) })
  const seats = useQuery({ queryKey: keys.seats(id), queryFn: () => fetchShowSeats(id), staleTime: 0 })
  useShowSeatsLive(id)

  const seatData = seats.data
  const selectedSeats = (seatData ?? []).filter(
    (seat) => selectedIds.includes(seat.id) && seat.status === 'available',
  )

  // Drop any selection that someone else took while we were choosing.
  useEffect(() => {
    if (!seatData) return
    setSelectedIds((current) => {
      const stillFree = current.filter((seatId) =>
        seatData.some((seat) => seat.id === seatId && seat.status === 'available'),
      )
      return stillFree.length === current.length ? current : stillFree
    })
  }, [seatData])

  const hold = useMutation({
    mutationFn: () => holdSeats({ showId: id, seatIds: selectedSeats.map((seat) => seat.id) }),
    onSuccess: ({ booking }) => {
      queryClient.invalidateQueries({ queryKey: keys.myBookings })
      navigate(`/checkout/${booking.id}`)
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: keys.seats(id) })
    },
  })

  function toggleSeat(seat: SeatView) {
    setNotice(null)
    hold.reset()
    if (selectedIds.includes(seat.id)) {
      setSelectedIds(selectedIds.filter((seatId) => seatId !== seat.id))
      return
    }
    if (selectedIds.length >= maxSeats) {
      setNotice(`You can hold up to ${maxSeats} seats at a time.`)
      return
    }
    setSelectedIds([...selectedIds, seat.id])
  }

  function handleHold() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/shows/${id}`)}`)
      return
    }
    hold.mutate()
  }

  if (show.isPending || seats.isPending) return <PageSpinner />
  if (show.isError || seats.isError) {
    return (
      <Container className="py-8">
        <ErrorMessage
          error={show.error ?? seats.error}
          onRetry={() => {
            show.refetch()
            seats.refetch()
          }}
        />
      </Container>
    )
  }

  const { data } = show
  const moviePath = `/movies/${data.movie.id}`

  return (
    <Container className="py-8">
      <nav aria-label="Breadcrumb" className="glass flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
          <li>
            <Link to="/" className="transition-colors hover:text-white">
              Movies
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link to={moviePath} className="transition-colors hover:text-white">
              {data.movie.title}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            {data.cinema.name} · {data.screen.name}
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-accent">
            {formatRelativeDay(data.startsAt)} · {formatTime(data.startsAt)}
          </li>
        </ol>
        <ButtonLink to={`${moviePath}?date=${dateKey(new Date(data.startsAt))}`} variant="secondary" size="sm">
          Change showtime
        </ButtonLink>
      </nav>

      <header className="mt-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{data.movie.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-400">
          <Badge>{data.movie.rating}</Badge>
          <span>{formatDuration(data.movie.durationMinutes)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {data.cinema.name}, {data.cinema.city}
          </span>
        </div>
      </header>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6">
        <div className="space-y-4">
          <SeatMap
            seats={seats.data}
            selectedIds={new Set(selectedSeats.map((seat) => seat.id))}
            onToggle={toggleSeat}
          />
          <SeatLegend prices={data.prices} />
        </div>
        <SelectionSummary
          seats={selectedSeats}
          prices={data.prices}
          maxSeats={maxSeats}
          pending={hold.isPending}
          error={hold.error ? holdErrorMessage(hold.error) : notice}
          needsLogin={!user}
          onRemove={toggleSeat}
          onHold={handleHold}
        />
      </div>
    </Container>
  )
}
