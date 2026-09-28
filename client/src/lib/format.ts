import { startOfDay } from './days'

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const date = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const time = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
})

const weekday = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
})

const dayInMs = 24 * 60 * 60 * 1000

export function formatMoney(amount: number): string {
  return money.format(amount)
}

export function formatDate(value: string | Date): string {
  return date.format(new Date(value))
}

export function formatTime(value: string | Date): string {
  return time.format(new Date(value))
}

export function formatWeekday(value: string | Date): string {
  return weekday.format(new Date(value))
}

// "Today", "Tomorrow", or a short date like "Wed, 30 Sept".
export function formatRelativeDay(value: string | Date): string {
  const daysAway = Math.round((startOfDay(new Date(value)).getTime() - startOfDay(new Date()).getTime()) / dayInMs)
  if (daysAway === 0) return 'Today'
  if (daysAway === 1) return 'Tomorrow'
  return formatDate(value)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours}h ${rest}m` : `${rest}m`
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
