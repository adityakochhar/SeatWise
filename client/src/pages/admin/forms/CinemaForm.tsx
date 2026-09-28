import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCinema } from '@/api/admin'
import { Input } from '@/components/ui/Input'
import { useFormFields } from '@/hooks/useFormFields'
import { keys } from '@/lib/query-keys'
import { requiredErrors } from '@/lib/validate'
import { FormFooter } from './FormFooter'

const empty = { name: '', city: '', address: '' }

export function CinemaForm() {
  const queryClient = useQueryClient()
  const form = useFormFields(empty)
  const [notice, setNotice] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: createCinema,
    onSuccess: (cinema) => {
      setNotice(`${cinema.name} was added.`)
      form.reset()
      queryClient.invalidateQueries({ queryKey: keys.adminCinemas })
      queryClient.invalidateQueries({ queryKey: keys.cities })
    },
    onError: form.applyError,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    if (!form.validate((values) => requiredErrors(values, ['name', 'city', 'address']))) return
    const { name, city, address } = form.values
    create.mutate({ name: name.trim(), city: city.trim(), address: address.trim() })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Name"
        value={form.values.name}
        onChange={(event) => form.setField('name', event.target.value)}
        error={form.errors.name}
      />
      <Input
        label="City"
        value={form.values.city}
        onChange={(event) => form.setField('city', event.target.value)}
        error={form.errors.city}
      />
      <Input
        label="Address"
        value={form.values.address}
        onChange={(event) => form.setField('address', event.target.value)}
        error={form.errors.address}
      />
      <FormFooter error={form.formError} notice={notice} pending={create.isPending} label="Add cinema" />
    </form>
  )
}
