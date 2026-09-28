import { Outlet } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from './useAuth'

// Rendered inside RequireAuth, so a user is always present here.
export function RequireAdmin() {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return (
      <Container className="py-16">
        <EmptyState
          title="Admins only"
          description="This area is for cinema administrators. Your account does not have access."
          action={<ButtonLink to="/">Back to movies</ButtonLink>}
        />
      </Container>
    )
  }
  return <Outlet />
}
