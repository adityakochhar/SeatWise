import type { FieldErrors } from './field-errors'

export function requiredErrors<T extends Record<string, string>>(
  values: T,
  names: Array<keyof T & string>,
): FieldErrors {
  const errors: FieldErrors = {}
  for (const name of names) {
    if (!values[name].trim()) errors[name] = 'This field is required.'
  }
  return errors
}

export function positiveInt(text: string): number | null {
  const value = Number(text)
  return Number.isInteger(value) && value > 0 ? value : null
}

export function isHexColor(text: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(text.trim())
}

export function splitList(text: string): string[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function safeNextPath(next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next
  return '/'
}
