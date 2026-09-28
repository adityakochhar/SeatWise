import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'

export function NotFoundPage() {
  return (
    <Container className="py-24 text-center">
      <p className="text-gradient inline-block text-8xl font-extrabold tracking-tight">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page isn't showing</h1>
      <p className="mx-auto mt-2 max-w-md text-neutral-400">The page you are looking for does not exist or has moved.</p>
      <ButtonLink to="/" className="mt-8">
        Back to movies
      </ButtonLink>
    </Container>
  )
}
