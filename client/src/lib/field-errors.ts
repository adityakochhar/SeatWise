export type FieldErrors = Record<string, string>

interface FieldIssue {
  field: string
  message: string
}

function isFieldIssue(value: unknown): value is FieldIssue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'field' in value &&
    typeof value.field === 'string' &&
    'message' in value &&
    typeof value.message === 'string'
  )
}

// The server's validation middleware sends details as [{ field, message }].
// A field can appear more than once, so keep the first message for each.
export function fieldErrorsFrom(details: unknown): FieldErrors {
  const errors: FieldErrors = {}
  if (!Array.isArray(details)) return errors
  for (const issue of details) {
    if (isFieldIssue(issue) && !errors[issue.field]) errors[issue.field] = issue.message
  }
  return errors
}
