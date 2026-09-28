import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

interface FormFooterProps {
  error: string | null
  notice: string | null
  pending: boolean
  label: string
}

export function FormFooter({ error, notice, pending, label }: FormFooterProps) {
  return (
    <div className="space-y-3 pt-2">
      {error && <ErrorMessage message={error} />}
      {notice && (
        <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </p>
      )}
      <Button type="submit" pending={pending}>
        {label}
      </Button>
    </div>
  )
}
