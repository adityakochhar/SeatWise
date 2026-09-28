export type Role = 'user' | 'admin'

export interface PublicUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthResponse {
  user: PublicUser
  token: string
}

export interface Movie {
  id: string
  title: string
  durationMinutes: number
  genres: string[]
  language: string
  rating: string
  description: string
  posterColor: string
}

export interface ShowPrices {
  standard: number
  premium: number
}

export interface ShowSummary {
  id: string
  startsAt: string
  endsAt: string
  prices: ShowPrices
  movie: { id: string; title: string; durationMinutes: number; rating: string }
  cinema: { id: string; name: string; city: string }
  screen: { id: string; name: string }
  availableSeats: number
  totalSeats: number
}

export type SeatType = 'standard' | 'premium'
export type SeatStatus = 'available' | 'held' | 'booked'

export interface SeatView {
  id: string
  row: string
  number: number
  label: string
  type: SeatType
  status: SeatStatus
}

export interface SeatsChangedEvent {
  showId: string
  seats: Array<{ id: string; status: SeatStatus }>
}

export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'expired'

export interface BookingView {
  id: string
  status: BookingStatus
  amount: number
  seatLabels: string[]
  expiresAt: string
  paidAt: string | null
  code: string | null
  show: {
    id: string
    startsAt: string
    movie: { id: string; title: string }
    cinema: { id: string; name: string; city: string }
    screen: { id: string; name: string }
  }
}

export interface Cinema {
  id: string
  name: string
  city: string
  address: string
}

export interface Screen {
  id: string
  cinemaId: string
  name: string
  rows: number
  seatsPerRow: number
  premiumRows: string[]
}

export interface OccupancyRow {
  showId: string
  movieTitle: string
  cinemaName: string
  startsAt: string
  booked: number
  total: number
}

export interface AdminStats {
  totalBookings: number
  paidBookings: number
  revenue: number
  upcomingShows: number
  occupancy: OccupancyRow[]
}
