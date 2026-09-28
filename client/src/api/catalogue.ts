import { request, toQueryString } from './client'
import type { Movie, SeatView, ShowSummary } from '@/types/api'

export type ShowFilters = {
  movieId?: string
  city?: string
  date?: string
}

export function fetchCities() {
  return request<string[]>('/cities')
}

export function fetchMovies() {
  return request<Movie[]>('/movies')
}

export function fetchMovie(id: string) {
  return request<Movie>(`/movies/${id}`)
}

export function fetchShows(filters: ShowFilters = {}) {
  return request<ShowSummary[]>(`/shows${toQueryString(filters)}`)
}

export function fetchShow(id: string) {
  return request<ShowSummary>(`/shows/${id}`)
}

export function fetchShowSeats(showId: string) {
  return request<SeatView[]>(`/shows/${showId}/seats`)
}
