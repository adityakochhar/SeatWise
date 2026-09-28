import { useEffect, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { AuthCard } from '@/components/layout/AuthCard'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Input } from '@/components/ui/Input'
import { useFormFields } from '@/hooks/useFormFields'
import { useQueryParam } from '@/hooks/useQueryParam'
import { requiredErrors, safeNextPath } from '@/lib/validate'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [next] = useQueryParam('next')
  const destination = safeNextPath(next)
  const form = useFormFields({ email: '', password: '' })

  useEffect(() => {
    if (user) navigate(destination, { replace: true })
  }, [user, destination, navigate])

  const submit = useMutation({
    mutationFn: () => login(form.values),
    onError: form.applyError,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.validate((values) => requiredErrors(values, ['email', 'password']))) return
    submit.mutate()
  }

  const registerPath = next ? `/register?next=${encodeURIComponent(next)}` : '/register'

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back. Log in to hold and pay for seats."
      footer={
        <>
          New here?{' '}
          <Link to={registerPath} className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
          autoComplete="current-password"
          value={form.values.password}
          onChange={(event) => form.setField('password', event.target.value)}
          error={form.errors.password}
        />
        {form.formError && <ErrorMessage message={form.formError} />}
        <Button type="submit" block pending={submit.isPending}>
          Log in
        </Button>
      </form>
    </AuthCard>
  )
}
