import { useQuery } from '@tanstack/react-query'
import { fetchMyBookings } from '@/api/bookings'
import { BookingCard } from '@/components/bookings/BookingCard'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { PageSpinner } from '@/components/ui/Spinner'
import { keys } from '@/lib/query-keys'

export function MyBookingsPage() {
  const bookings = useQuery({ queryKey: keys.myBookings, queryFn: fetchMyBookings })

  return (
    <Container className="py-10">
      <p className="eyebrow">Your tickets</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">My bookings</h1>
      <div className="mt-8">
        {bookings.isPending && <PageSpinner />}
        {bookings.isError && <ErrorMessage error={bookings.error} onRetry={bookings.refetch} />}
        {bookings.isSuccess && bookings.data.length === 0 && (
          <EmptyState
            title="No bookings yet"
            description="Seats you hold or pay for will show up here."
            action={<ButtonLink to="/">Browse movies</ButtonLink>}
          />
        )}
        {bookings.isSuccess && bookings.data.length > 0 && (
          <div className="space-y-4">
            {bookings.data.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
