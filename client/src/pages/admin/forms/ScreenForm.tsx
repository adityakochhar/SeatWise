import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createScreen, fetchCinemas } from '@/api/admin'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useFormFields } from '@/hooks/useFormFields'
import type { FieldErrors } from '@/lib/field-errors'
import { keys } from '@/lib/query-keys'
import { positiveInt, requiredErrors, splitList } from '@/lib/validate'
import { FormFooter } from './FormFooter'

const empty = { cinemaId: '', name: '', rows: '', seatsPerRow: '', premiumRows: '' }
const maxRows = 26
const maxSeatsPerRow = 40

function premiumLetters(text: string): string[] {
  return splitList(text).map((letter) => letter.toUpperCase())
}

function rules(values: typeof empty): FieldErrors {
  const errors = requiredErrors(values, ['cinemaId', 'name', 'rows', 'seatsPerRow'])
  const rows = positiveInt(values.rows)
  if (values.rows && (rows === null || rows > maxRows)) {
    errors.rows = `Enter a whole number from 1 to ${maxRows}.`
  }
  const seatsPerRow = positiveInt(values.seatsPerRow)
  if (values.seatsPerRow && (seatsPerRow === null || seatsPerRow > maxSeatsPerRow)) {
    errors.seatsPerRow = `Enter a whole number from 1 to ${maxSeatsPerRow}.`
  }
  if (premiumLetters(values.premiumRows).some((letter) => !/^[A-Z]$/.test(letter))) {
    errors.premiumRows = 'Use single row letters separated by commas, like A, B.'
  }
  return errors
}

export function ScreenForm() {
  const queryClient = useQueryClient()
  const cinemas = useQuery({ queryKey: keys.adminCinemas, queryFn: fetchCinemas })
  const form = useFormFields(empty)
  const [notice, setNotice] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: createScreen,
    onSuccess: (screen) => {
      setNotice(`${screen.name} was added with ${screen.rows * screen.seatsPerRow} seats.`)
      form.reset()
      queryClient.invalidateQueries({ queryKey: keys.adminScreens(screen.cinemaId) })
    },
    onError: form.applyError,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    if (!form.validate(rules)) return
    const { values } = form
    create.mutate({
      cinemaId: values.cinemaId,
      name: values.name.trim(),
      rows: Number(values.rows),
      seatsPerRow: Number(values.seatsPerRow),
      premiumRows: premiumLetters(values.premiumRows),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {cinemas.isError && <ErrorMessage error={cinemas.error} onRetry={cinemas.refetch} />}
      <Select
        label="Cinema"
        value={form.values.cinemaId}
        disabled={cinemas.isPending}
        onChange={(event) => form.setField('cinemaId', event.target.value)}
        error={form.errors.cinemaId}
      >
        <option value="">Select a cinema</option>
        {cinemas.data?.map((cinema) => (
          <option key={cinema.id} value={cinema.id}>
            {cinema.name} ({cinema.city})
          </option>
        ))}
      </Select>
      <Input
        label="Screen name"
        placeholder="Screen 1"
        value={form.values.name}
        onChange={(event) => form.setField('name', event.target.value)}
        error={form.errors.name}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Rows"
          type="number"
          min={1}
          max={maxRows}
          value={form.values.rows}
          onChange={(event) => form.setField('rows', event.target.value)}
          error={form.errors.rows}
        />
        <Input
          label="Seats per row"
          type="number"
          min={1}
          max={maxSeatsPerRow}
          value={form.values.seatsPerRow}
          onChange={(event) => form.setField('seatsPerRow', event.target.value)}
          error={form.errors.seatsPerRow}
        />
      </div>
      <Input
        label="Premium rows"
        placeholder="A, B"
        hint="Row letters separated by commas. Leave empty for none."
        value={form.values.premiumRows}
        onChange={(event) => form.setField('premiumRows', event.target.value)}
        error={form.errors.premiumRows}
      />
      <FormFooter error={form.formError} notice={notice} pending={create.isPending} label="Add screen" />
    </form>
  )
}
