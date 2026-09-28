import { useState, type ComponentType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchStats } from '@/api/admin'
import { Container } from '@/components/layout/Container'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { keys } from '@/lib/query-keys'
import { CinemaForm } from './forms/CinemaForm'
import { MovieForm } from './forms/MovieForm'
import { ScreenForm } from './forms/ScreenForm'
import { ShowForm } from './forms/ShowForm'
import { OccupancyTable } from './OccupancyTable'
import { StatsCards } from './StatsCards'

const tabs = [
  { id: 'cinema', label: 'Cinema' },
  { id: 'screen', label: 'Screen' },
  { id: 'movie', label: 'Movie' },
  { id: 'show', label: 'Show' },
] as const

type TabId = (typeof tabs)[number]['id']

const forms: Record<TabId, ComponentType> = {
  cinema: CinemaForm,
  screen: ScreenForm,
  movie: MovieForm,
  show: ShowForm,
}

function StatsSection() {
  const stats = useQuery({ queryKey: keys.adminStats, queryFn: fetchStats })

  if (stats.isPending) return <PageSpinner />
  if (stats.isError) return <ErrorMessage error={stats.error} onRetry={stats.refetch} />

  return (
    <div className="space-y-6">
      <StatsCards stats={stats.data} />
      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight">Upcoming show occupancy</h2>
        <OccupancyTable rows={stats.data.occupancy} />
      </div>
    </div>
  )
}

export function AdminPage() {
  const [tab, setTab] = useState<TabId>('cinema')
  const ActiveForm = forms[tab]

  return (
    <Container className="space-y-14 py-10">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-neutral-400">Overview of bookings and tools to manage the catalogue.</p>
      </header>

      <StatsSection />

      <section>
        <h2 className="text-xl font-bold tracking-tight">Add to the catalogue</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Work left to right: a show needs a screen, and a screen needs a cinema.
        </p>
        <div
          role="tablist"
          aria-label="Catalogue forms"
          className="mt-5 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1"
        >
          {tabs.map((item) => {
            const active = item.id === tab
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  active ? 'bg-accent text-ink' : 'text-neutral-400 hover:text-white',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
        <div role="tabpanel" className="glass mt-6 max-w-xl p-6">
          <ActiveForm />
        </div>
      </section>
    </Container>
  )
}
