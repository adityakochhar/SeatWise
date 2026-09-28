import { cn } from '@/lib/cn'
import { passwordStrength } from '@/lib/password'

// Bar colour for each score: 0 and 1 red, 2 amber, 3 and 4 teal.
const barColors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-accent', 'bg-accent']

interface PasswordMeterProps {
  password: string
  minLength: number
}

export function PasswordMeter({ password, minLength }: PasswordMeterProps) {
  if (!password) return null
  const { score, label } = passwordStrength(password, minLength)

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={cn('h-1 flex-1 rounded-full', step <= score ? barColors[score] : 'bg-white/10')} />
        ))}
      </div>
      <span className="w-16 text-right text-xs text-neutral-400" aria-live="polite">
        {label}
      </span>
    </div>
  )
}
