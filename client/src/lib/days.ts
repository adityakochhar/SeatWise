// The date pickers offer this many days, starting today. The seed script schedules shows over the same window.
export const bookingWindowDays = 5

export function startOfDay(value: Date): Date {
  const day = new Date(value)
  day.setHours(0, 0, 0, 0)
  return day
}

export function upcomingDays(count = bookingWindowDays): Date[] {
  const today = startOfDay(new Date())
  return Array.from({ length: count }, (_, offset) => {
    const day = new Date(today)
    day.setDate(today.getDate() + offset)
    return day
  })
}

// The YYYY-MM-DD form the API expects for its ?date= filter.
export function dateKey(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
