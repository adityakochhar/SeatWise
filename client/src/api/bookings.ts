import { request } from './client'
import type { BookingView } from '@/types/api'

export interface HoldInput {
  showId: string
  seatIds: string[]
}

interface BookingResponse {
  booking: BookingView
}

export function holdSeats(input: HoldInput) {
  return request<BookingResponse>('/bookings/hold', { method: 'POST', body: input })
}

export function confirmBooking(id: string) {
  return request<BookingResponse>(`/bookings/${id}/confirm`, { method: 'POST' })
}

export function cancelBooking(id: string) {
  return request<BookingResponse>(`/bookings/${id}/cancel`, { method: 'POST' })
}

export function fetchMyBookings() {
  return request<BookingView[]>('/bookings/me')
}

export function fetchBooking(id: string) {
  return request<BookingView>(`/bookings/${id}`)
}
