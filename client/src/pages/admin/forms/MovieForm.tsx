import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMovie } from '@/api/admin'
import { PosterTile } from '@/components/movies/PosterTile'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useFormFields } from '@/hooks/useFormFields'
import type { FieldErrors } from '@/lib/field-errors'
import { keys } from '@/lib/query-keys'
import { isHexColor, positiveInt, requiredErrors, splitList } from '@/lib/validate'
import { FormFooter } from './FormFooter'

const empty = {
  title: '',
  durationMinutes: '',
  genres: '',
  language: '',
  rating: '',
  description: '',
  posterColor: '#0F766E',
}

function rules(values: typeof empty): FieldErrors {
  const errors = requiredErrors(values, [
    'title',
    'durationMinutes',
    'genres',
    'language',
    'rating',
    'description',
    'posterColor',
  ])
  if (values.durationMinutes && positiveInt(values.durationMinutes) === null) {
    errors.durationMinutes = 'Enter the running time in whole minutes.'
  }
  if (values.posterColor && !isHexColor(values.posterColor)) {
    errors.posterColor = 'Use a hex colour like #0F766E.'
  }
  return errors
}

export function MovieForm() {
  const queryClient = useQueryClient()
  const form = useFormFields(empty)
  const [notice, setNotice] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: createMovie,
    onSuccess: (movie) => {
      setNotice(`${movie.title} was added.`)
      form.reset()
      queryClient.invalidateQueries({ queryKey: keys.movies })
    },
    onError: form.applyError,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    if (!form.validate(rules)) return
    const { values } = form
    create.mutate({
      title: values.title.trim(),
      durationMinutes: Number(values.durationMinutes),
      genres: splitList(values.genres),
      language: values.language.trim(),
      rating: values.rating.trim(),
      description: values.description.trim(),
      posterColor: values.posterColor.trim().toUpperCase(),
    })
  }

  const previewColor = isHexColor(form.values.posterColor) ? form.values.posterColor : '#9CA3AF'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Title"
        value={form.values.title}
        onChange={(event) => form.setField('title', event.target.value)}
        error={form.errors.title}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duration (minutes)"
          type="number"
          min={1}
          value={form.values.durationMinutes}
          onChange={(event) => form.setField('durationMinutes', event.target.value)}
          error={form.errors.durationMinutes}
        />
        <Input
          label="Rating"
          placeholder="UA"
          value={form.values.rating}
          onChange={(event) => form.setField('rating', event.target.value)}
          error={form.errors.rating}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Language"
          value={form.values.language}
          onChange={(event) => form.setField('language', event.target.value)}
          error={form.errors.language}
        />
        <Input
          label="Genres"
          placeholder="Drama, Thriller"
          value={form.values.genres}
          onChange={(event) => form.setField('genres', event.target.value)}
          error={form.errors.genres}
        />
      </div>
      <Textarea
        label="Description"
        rows={3}
        value={form.values.description}
        onChange={(event) => form.setField('description', event.target.value)}
        error={form.errors.description}
      />
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <Input
            label="Poster colour"
            hint="Used to draw the poster tile."
            value={form.values.posterColor}
            onChange={(event) => form.setField('posterColor', event.target.value)}
            error={form.errors.posterColor}
          />
        </div>
        <PosterTile title={form.values.title || 'New movie'} color={previewColor} size="sm" className="mt-7 w-12" />
      </div>
      <FormFooter error={form.formError} notice={notice} pending={create.isPending} label="Add movie" />
    </form>
  )
}
