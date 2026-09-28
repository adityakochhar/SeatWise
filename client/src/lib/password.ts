const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const

export interface PasswordStrength {
  score: number
  label: (typeof labels)[number]
}

// A rough guide for the sign-up form, from 0 (too short) to 4 (strong).
// The server only enforces the minimum length; the rest is advice.
export function passwordStrength(password: string, minLength: number): PasswordStrength {
  if (password.length < minLength) return { score: 0, label: labels[0] }

  let score = 1
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++

  return { score, label: labels[score] }
}
