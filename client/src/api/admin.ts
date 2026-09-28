import { request, toQueryString } from './client'
import type { AdminStats, Cinema, Movie, Screen, ShowPrices, ShowSummary } from '@/types/api'

export interface CinemaInput {
  name: string
  city: string
  address: string
}

export interface ScreenInput {
  cinemaId: string
  name: string
  rows: number
  seatsPerRow: number
  premiumRows: string[]
}

export interface MovieInput {
  title: string
  durationMinutes: number
  genres: string[]
  language: string
  rating: string
  description: string
  posterColor: string
}

export interface ShowInput {
  movieId: string
  screenId: string
  startsAt: string
  prices: ShowPrices
}

export function createCinema(input: CinemaInput) {
  return request<Cinema>('/admin/cinemas', { method: 'POST', body: input })
}

export function fetchCinemas() {
  return request<Cinema[]>('/admin/cinemas')
}

export function createScreen(input: ScreenInput) {
  return request<Screen>('/admin/screens', { method: 'POST', body: input })
}

export function fetchScreens(cinemaId: string) {
  return request<Screen[]>(`/admin/screens${toQueryString({ cinemaId })}`)
}

export function createMovie(input: MovieInput) {
  return request<Movie>('/admin/movies', { method: 'POST', body: input })
}

export function createShow(input: ShowInput) {
  return request<ShowSummary>('/admin/shows', { method: 'POST', body: input })
}

export function fetchStats() {
  return request<AdminStats>('/admin/stats')
}
