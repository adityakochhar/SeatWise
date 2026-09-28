import { useId, type InputHTMLAttributes } from 'react'
import { controlClasses, Field } from './Field'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field id={inputId} label={label} error={error} hint={hint}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={controlClasses(error, className)}
        {...rest}
      />
    </Field>
  )
}
