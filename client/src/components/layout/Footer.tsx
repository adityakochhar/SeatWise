import { TicketIcon } from '@/components/ui/icons'
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] py-8 text-xs text-neutral-500">
      <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2">
          <TicketIcon className="h-4 w-4 text-accent" />
          SeatWise. Payments are simulated; no money changes hands.
        </span>
        <span>Seats are held for 5 minutes while you check out.</span>
      </Container>
    </footer>
  )
}
