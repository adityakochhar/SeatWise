export function SeatChips({ labels }: { labels: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <span key={label} className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-xs text-neutral-200">
          {label}
        </span>
      ))}
    </span>
  )
}
