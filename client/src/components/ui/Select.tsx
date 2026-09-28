import { useId, type SelectHTMLAttributes } from 'react'
import { controlClasses, Field } from './Field'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  hint?: string
}

export function Select({ label, error, hint, id, className, children, ...rest }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <Field id={selectId} label={label} error={error} hint={hint}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={controlClasses(error, className)}
        {...rest}
      >
        {children}
      </select>
    </Field>
  )
}
