import { createContext } from 'react'
import type { LoginInput, RegisterInput } from '@/api/auth'
import type { PublicUser } from '@/types/api'

export interface AuthContextValue {
  user: PublicUser | null
  loading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
