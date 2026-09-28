import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { cancelBooking, confirmBooking, fetchBooking } from '@/api/bookings'
import { BookingSummary } from '@/components/bookings/BookingSummary'
import { HoldCountdown } from '@/components/bookings/HoldCountdown'
import { TicketTear } from '@/components/bookings/TicketTear'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { CheckIcon } from '@/components/ui/icons'
import { PageSpinner } from '@/components/ui/Spinner'
import { useCountdown } from '@/hooks/useCountdown'
import { formatMoney } from '@/lib/format'
import { keys } from '@/lib/query-keys'
import type { BookingView } from '@/types/api'

interface PaymentPanelProps {
  booking: BookingView
  remainingMs: number
  paying: boolean
  releasing: boolean
  error: Error | null
  onPay: () => void
  onRelease: () => void
}

function PaymentPanel({ booking, remainingMs, paying, releasing, error, onPay, onRelease }: PaymentPanelProps) {
  return (
    <div className="glass space-y-5 p-5 sm:p-6">
      <HoldCountdown remainingMs={remainingMs} />
      {error && <ErrorMessage error={error} />}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" pending={paying} disabled={releasing} onClick={onPay} className="sm:flex-1">
          Pay {formatMoney(booking.amount)}
        </Button>
        <Button size="lg" variant="danger" pending={releasing} disabled={paying} onClick={onRelease}>
          Release seats
        </Button>
      </div>
      <p className="text-center text-xs text-neutral-500">
        Payment is simulated. No card details are needed and nothing is charged.
      </p>
    </div>
  )
}

function TicketPanel({ booking }: { booking: BookingView }) {
  return (
    <div className="glass overflow-hidden border-accent/30 text-center">
      <div className="p-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent shadow-glow ring-1 ring-accent/30">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-2xl font-bold">Booking confirmed</h2>
        <p className="mt-1 text-sm text-neutral-400">Show this code at the counter.</p>
      </div>
      <TicketTear />
      <div className="p-8">
        {booking.code && (
          <p className="text-gradient inline-block font-mono text-4xl font-semibold tracking-[0.3em]">{booking.code}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/bookings" variant="secondary">
            My bookings
          </ButtonLink>
          <ButtonLink to="/">Book another</ButtonLink>
        </div>
      </div>
    </div>
  )
}

interface ClosedPanelProps {
  title: string
  text: string
  to: string
  label: string
}

function ClosedPanel({ title, text, to, label }: ClosedPanelProps) {
  return (
    <div className="glass p-8 text-center">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-400">{text}</p>
      <ButtonLink to={to} className="mt-6">
        {label}
      </ButtonLink>
    </div>
  )
}

export function CheckoutPage() {
  const { bookingId = '' } = useParams()
  const queryClient = useQueryClient()
  const booking = useQuery({ queryKey: keys.booking(bookingId), queryFn: () => fetchBooking(bookingId) })
  const current = booking.data
  const { remainingMs, expired } = useCountdown(current?.status === 'pending' ? current.expiresAt : null)

  function storeBooking(response: { booking: BookingView }) {
    queryClient.setQueryData(keys.booking(bookingId), response.booking)
    queryClient.invalidateQueries({ queryKey: keys.myBookings })
  }

  function refreshBooking() {
    queryClient.invalidateQueries({ queryKey: keys.booking(bookingId) })
  }

  const confirm = useMutation({
    mutationFn: () => confirmBooking(bookingId),
    onSuccess: storeBooking,
    onError: refreshBooking,
  })
  const cancel = useMutation({
    mutationFn: () => cancelBooking(bookingId),
    onSuccess: storeBooking,
    onError: refreshBooking,
  })

  if (booking.isPending) return <PageSpinner />
  if (booking.isError) {
    return (
      <Container className="py-8">
        <ErrorMessage error={booking.error} onRetry={booking.refetch} />
      </Container>
    )
  }

  const { data } = booking
  const showPath = `/shows/${data.show.id}`

  let panel: ReactNode
  if (data.status === 'paid') {
    panel = <TicketPanel booking={data} />
  } else if (data.status === 'cancelled') {
    panel = (
      <ClosedPanel
        title="Seats released"
        text="This booking was cancelled and the seats are available again."
        to={showPath}
        label="Back to the show"
      />
    )
  } else if (data.status === 'expired' || expired) {
    panel = (
      <ClosedPanel
        title="Your hold expired"
        text="The seats were released so others can book them. You can pick seats again."
        to={showPath}
        label="Choose seats again"
      />
    )
  } else {
    panel = (
      <PaymentPanel
        booking={data}
        remainingMs={remainingMs}
        paying={confirm.isPending}
        releasing={cancel.isPending}
        error={confirm.error ?? cancel.error}
        onPay={() => confirm.mutate()}
        onRelease={() => cancel.mutate()}
      />
    )
  }

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Your booking</h1>
        <div className="mt-8 space-y-5">
          <BookingSummary booking={data} />
          {panel}
        </div>
      </div>
    </Container>
  )
}
