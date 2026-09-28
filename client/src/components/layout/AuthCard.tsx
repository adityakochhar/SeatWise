import type { ReactNode } from 'react'
import { CheckIcon } from '@/components/ui/icons'
import { Container } from './Container'

// What SeatWise actually does, shown next to the log in and sign up forms.
const highlights = [
  'A live seat map. Seats go grey the moment someone else holds them.',
  'Your seats are held for five minutes while you pay.',
  'A ticket code as soon as your booking is confirmed.',
]

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Container className="py-12 md:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[minmax(0,1fr)_26rem]">
        <section className="hidden md:block">
          <p className="eyebrow">Book in under a minute</p>
          <h2 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight">
            Your seat, <span className="text-gradient">saved for you.</span>
          </h2>
          <ul className="mt-8 space-y-4 text-neutral-400">
            {highlights.map((text) => (
              <li key={text} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                  <CheckIcon className="h-3 w-3" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </section>

        <div className="glass p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-neutral-400">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <p className="mt-7 text-center text-sm text-neutral-400">{footer}</p>
        </div>
      </div>
    </Container>
  )
}
