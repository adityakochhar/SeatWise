// The dashed "tear here" line across a ticket, with a half-circle notch cut into each edge.
// The parent needs overflow-hidden so the notches are clipped into half circles.
export function TicketTear() {
  return (
    <div aria-hidden="true" className="relative h-px">
      <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-white/[0.08] bg-ink" />
      <div className="mx-5 border-t border-dashed border-white/15" />
      <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-white/[0.08] bg-ink" />
    </div>
  )
}
