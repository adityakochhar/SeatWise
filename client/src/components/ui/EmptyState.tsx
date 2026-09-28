import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="glass border-dashed px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
