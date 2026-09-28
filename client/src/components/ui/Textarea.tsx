import { useId, type TextareaHTMLAttributes } from 'react'
import { controlClasses, Field } from './Field'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, id, className, ...rest }: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  return (
    <Field id={textareaId} label={label} error={error} hint={hint}>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={controlClasses(error, className)}
        {...rest}
      />
    </Field>
  )
}
