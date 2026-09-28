import { useState } from 'react'
import { ApiError, errorMessage } from '@/api/client'
import { fieldErrorsFrom, type FieldErrors } from '@/lib/field-errors'

export function useFormFields<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  function setField(name: keyof T & string, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
    setFormError(null)
  }

  function validate(rules: (values: T) => FieldErrors): boolean {
    const problems = rules(values)
    setErrors(problems)
    return Object.keys(problems).length === 0
  }

  function applyError(error: unknown) {
    if (error instanceof ApiError) {
      setErrors(fieldErrorsFrom(error.details))
      setFormError(error.message)
      return
    }
    setFormError(errorMessage(error))
  }

  function reset() {
    setValues(initial)
    setErrors({})
    setFormError(null)
  }

  return { values, errors, formError, setField, validate, applyError, reset }
}
