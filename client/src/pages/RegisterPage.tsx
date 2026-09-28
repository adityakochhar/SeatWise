import { useEffect, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { AuthCard } from '@/components/layout/AuthCard'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Input } from '@/components/ui/Input'
import { PasswordMeter } from '@/components/ui/PasswordMeter'
import { useFormFields } from '@/hooks/useFormFields'
import { useQueryParam } from '@/hooks/useQueryParam'
import { requiredErrors, safeNextPath } from '@/lib/validate'

const minPasswordLength = 8

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [next] = useQueryParam('next')
  const destination = safeNextPath(next)
  const form = useFormFields({ name: '', email: '', password: '' })

  useEffect(() => {
    if (user) navigate(destination, { replace: true })
  }, [user, destination, navigate])

  const submit = useMutation({
    mutationFn: () => register(form.values),
    onError: form.applyError,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const valid = form.validate((values) => {
      const errors = requiredErrors(values, ['name', 'email', 'password'])
      if (values.password && values.password.length < minPasswordLength) {
        errors.password = `Use at least ${minPasswordLength} characters.`
      }
      return errors
    })
    if (valid) submit.mutate()
  }

  const loginPath = next ? `/login?next=${encodeURIComponent(next)}` : '/login'

  return (
    <AuthCard
      title="Create an account"
      subtitle="Book seats in under a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to={loginPath} className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Name"
          autoComplete="name"
          value={form.values.name}
          onChange={(event) => form.setField('name', event.target.value)}
          error={form.errors.name}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.values.email}
          onChange={(event) => form.setField('email', event.target.value)}
          error={form.errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.values.password}
          onChange={(event) => form.setField('password', event.target.value)}
          error={form.errors.password}
          hint={`At least ${minPasswordLength} characters.`}
        />
        <PasswordMeter password={form.values.password} minLength={minPasswordLength} />
        {form.formError && <ErrorMessage message={form.formError} />}
        <Button type="submit" block pending={submit.isPending}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
