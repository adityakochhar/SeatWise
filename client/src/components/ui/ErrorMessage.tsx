import { errorMessage } from '@/api/client'
import { cn } from '@/lib/cn'

interface ErrorMessageProps {
  error?: unknown
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ error, message, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200', className)}
    >
      <p>{message ?? errorMessage(error)}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 font-medium text-red-100 underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  )
}
