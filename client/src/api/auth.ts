import { request } from './client'
import type { AuthResponse, PublicUser } from '@/types/api'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export function login(input: LoginInput) {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: input })
}

export function register(input: RegisterInput) {
  return request<AuthResponse>('/auth/register', { method: 'POST', body: input })
}

export function fetchMe() {
  return request<PublicUser>('/auth/me')
}
