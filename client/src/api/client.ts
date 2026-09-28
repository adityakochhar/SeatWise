const configuredUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export const apiOrigin = configuredUrl.replace(/\/+$/, '')

const tokenKey = 'seatwise.token'

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function readToken(): string | null {
  return localStorage.getItem(tokenKey)
}

export function storeToken(token: string | null) {
  if (token) {
    localStorage.setItem(tokenKey, token)
  } else {
    localStorage.removeItem(tokenKey)
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
}

interface ErrorBody {
  message: string
  details?: unknown
}

function isErrorBody(value: unknown): value is ErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  )
}

function parseJson(text: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = readToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${apiOrigin}/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Please check your connection and try again.')
  }

  const data = parseJson(await response.text())

  if (!response.ok) {
    if (isErrorBody(data)) throw new ApiError(response.status, data.message, data.details)
    throw new ApiError(response.status, `The server responded with status ${response.status}.`)
  }

  return data as T
}

export function toQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}
