import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { buttonClasses } from '@/components/ui/Button'
import { CloseIcon, LogOutIcon, MenuIcon, TicketIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import type { PublicUser } from '@/types/api'
import { Container } from './Container'

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-white/[0.08] text-white' : 'text-neutral-400 hover:text-white',
  )
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
        <TicketIcon className="h-4 w-4" />
      </span>
      SeatWise
    </Link>
  )
}

// Pages a visitor can open. Which ones show depends on who is logged in.
function PageLinks({ user }: { user: PublicUser | null }) {
  return (
    <>
      <NavLink to="/" end className={navLinkClasses}>
        Movies
      </NavLink>
      {user && (
        <NavLink to="/bookings" className={navLinkClasses}>
          My bookings
        </NavLink>
      )}
      {user?.role === 'admin' && (
        <NavLink to="/admin" className={navLinkClasses}>
          Admin
        </NavLink>
      )}
    </>
  )
}

interface AccountActionsProps {
  user: PublicUser | null
  onLogout: () => void
}

function AccountActions({ user, onLogout }: AccountActionsProps) {
  if (!user) {
    return (
      <>
        <ButtonLink to="/login" variant="ghost" size="sm">
          Log in
        </ButtonLink>
        <ButtonLink to="/register" size="sm">
          Sign up
        </ButtonLink>
      </>
    )
  }

  return (
    <>
      <span className="flex items-center gap-2 pr-1 text-sm text-neutral-300">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent/40 to-indigo-400/40 text-xs font-bold text-white ring-1 ring-white/15"
        >
          {initials(user.name)}
        </span>
        {user.name}
      </span>
      <button type="button" onClick={onLogout} className={buttonClasses('ghost', 'sm')}>
        <LogOutIcon className="h-4 w-4" />
        Log out
      </button>
    </>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 pt-3 sm:pt-4">
      <Container>
        <div className="flex h-14 items-center justify-between gap-4 rounded-full border border-white/[0.08] bg-ink/70 pl-4 pr-2 shadow-lg shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              <PageLinks user={user} />
            </nav>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <AccountActions user={user} onLogout={handleLogout} />
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-neutral-300 hover:bg-white/10 hover:text-white md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((current) => !current)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div id="mobile-menu" className="glass mt-2 bg-ink/90 p-2 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Main">
              <PageLinks user={user} />
            </nav>
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 px-1 pt-3">
              <AccountActions user={user} onLogout={handleLogout} />
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
