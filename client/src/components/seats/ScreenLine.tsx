export function ScreenLine() {
  return (
    <div className="relative mx-auto max-w-lg">
      {/* A blurred glow behind a curved line, like light spilling off a cinema screen. */}
      <div aria-hidden="true" className="absolute inset-x-12 -top-5 h-12 rounded-full bg-accent/25 blur-2xl" />
      <div aria-hidden="true" className="relative h-4 rounded-t-[50%] border-t-[3px] border-accent" />
      <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500">
        Screen this way
      </p>
    </div>
  )
}
