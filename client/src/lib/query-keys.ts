import type { ShowFilters } from '@/api/catalogue'

export const keys = {
  cities: ['cities'] as const,
  movies: ['movies'] as const,
  movie: (id: string) => ['movies', id] as const,
  shows: (filters: ShowFilters) => ['shows', filters] as const,
  show: (id: string) => ['shows', id] as const,
  seats: (showId: string) => ['shows', showId, 'seats'] as const,
  myBookings: ['bookings', 'me'] as const,
  booking: (id: string) => ['bookings', id] as const,
  adminCinemas: ['admin', 'cinemas'] as const,
  adminScreens: (cinemaId: string) => ['admin', 'screens', cinemaId] as const,
  adminStats: ['admin', 'stats'] as const,
}
