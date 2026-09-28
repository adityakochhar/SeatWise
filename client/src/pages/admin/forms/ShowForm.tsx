import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createShow, fetchCinemas, fetchScreens } from '@/api/admin'
import { fetchMovies } from '@/api/catalogue'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useFormFields } from '@/hooks/useFormFields'
import type { FieldErrors } from '@/lib/field-errors'
import { formatDate, formatTime } from '@/lib/format'
import { keys } from '@/lib/query-keys'
import { positiveInt, requiredErrors } from '@/lib/validate'
import { FormFooter } from './FormFooter'

const empty = { cinemaId: '', screenId: '', movieId: '', startsAt: '', standard: '', premium: '' }

function rules(values: typeof empty): FieldErrors {
  const errors = requiredErrors(values, ['cinemaId', 'screenId', 'movieId', 'startsAt', 'standard', 'premium'])
  if (values.startsAt) {
    const startsAt = new Date(values.startsAt)
    if (Number.isNaN(startsAt.getTime())) {
      errors.startsAt = 'Enter a valid date and time.'
    } else if (startsAt.getTime() < Date.now()) {
      errors.startsAt = 'Pick a time in the future.'
    }
  }
  if (values.standard && positiveInt(values.standard) === null) {
    errors.standard = 'Enter a whole rupee amount.'
  }
  if (values.premium && positiveInt(values.premium) === null) {
    errors.premium = 'Enter a whole rupee amount.'
  }
  return errors
}

export function ShowForm() {
  const queryClient = useQueryClient()
  const form = useFormFields(empty)
  const [notice, setNotice] = useState<string | null>(null)
  const { cinemaId } = form.values

  const cinemas = useQuery({ queryKey: keys.adminCinemas, queryFn: fetchCinemas })
  const movies = useQuery({ queryKey: keys.movies, queryFn: fetchMovies })
  const screens = useQuery({
    queryKey: keys.adminScreens(cinemaId),
    queryFn: () => fetchScreens(cinemaId),
    enabled: cinemaId !== '',
  })

  const create = useMutation({
    mutationFn: createShow,
    onSuccess: (show) => {
      setNotice(`${show.movie.title} was scheduled for ${formatDate(show.startsAt)} at ${formatTime(show.startsAt)}.`)
      form.setField('startsAt', '')
      queryClient.invalidateQueries({ queryKey: ['shows'] })
      queryClient.invalidateQueries({ queryKey: keys.adminStats })
    },
    onError: form.applyError,
  })

  function handleCinemaChange(value: string) {
    form.setField('cinemaId', value)
    form.setField('screenId', '')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    if (!form.validate(rules)) return
    const { values } = form
    create.mutate({
      movieId: values.movieId,
      screenId: values.screenId,
      startsAt: new Date(values.startsAt).toISOString(),
      prices: { standard: Number(values.standard), premium: Number(values.premium) },
    })
  }

  const loadError = cinemas.error ?? movies.error ?? screens.error

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {loadError && <ErrorMessage error={loadError} />}
      <Select
        label="Cinema"
        value={cinemaId}
        disabled={cinemas.isPending}
        onChange={(event) => handleCinemaChange(event.target.value)}
        error={form.errors.cinemaId}
      >
        <option value="">Select a cinema</option>
        {cinemas.data?.map((cinema) => (
          <option key={cinema.id} value={cinema.id}>
            {cinema.name} ({cinema.city})
          </option>
        ))}
      </Select>
      <Select
        label="Screen"
        value={form.values.screenId}
        disabled={cinemaId === '' || screens.isPending}
        onChange={(event) => form.setField('screenId', event.target.value)}
        error={form.errors.screenId}
        hint={cinemaId === '' ? 'Choose a cinema first.' : undefined}
      >
        <option value="">Select a screen</option>
        {screens.data?.map((screen) => (
          <option key={screen.id} value={screen.id}>
            {screen.name} ({screen.rows * screen.seatsPerRow} seats)
          </option>
        ))}
      </Select>
      <Select
        label="Movie"
        value={form.values.movieId}
        disabled={movies.isPending}
        onChange={(event) => form.setField('movieId', event.target.value)}
        error={form.errors.movieId}
      >
        <option value="">Select a movie</option>
        {movies.data?.map((movie) => (
          <option key={movie.id} value={movie.id}>
            {movie.title}
          </option>
        ))}
      </Select>
      <Input
        label="Starts at"
        type="datetime-local"
        value={form.values.startsAt}
        onChange={(event) => form.setField('startsAt', event.target.value)}
        error={form.errors.startsAt}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Standard price (INR)"
          type="number"
          min={1}
          value={form.values.standard}
          onChange={(event) => form.setField('standard', event.target.value)}
          error={form.errors.standard ?? form.errors['prices.standard']}
        />
        <Input
          label="Premium price (INR)"
          type="number"
          min={1}
          value={form.values.premium}
          onChange={(event) => form.setField('premium', event.target.value)}
          error={form.errors.premium ?? form.errors['prices.premium']}
        />
      </div>
      <FormFooter error={form.formError} notice={notice} pending={create.isPending} label="Add show" />
    </form>
  )
}
