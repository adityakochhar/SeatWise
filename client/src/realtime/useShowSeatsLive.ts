import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { keys } from '@/lib/query-keys'
import type { SeatView, SeatsChangedEvent } from '@/types/api'
import { getSocket } from './socket'

export function useShowSeatsLive(showId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!showId) return
    const socket = getSocket()
    const queryKey = keys.seats(showId)

    function patchSeats(event: SeatsChangedEvent) {
      if (event.showId !== showId) return
      const changes = new Map(event.seats.map((seat) => [seat.id, seat.status]))
      queryClient.setQueryData<SeatView[]>(queryKey, (current) => {
        if (!current) return current
        return current.map((seat) => {
          const status = changes.get(seat.id)
          return status ? { ...seat, status } : seat
        })
      })
    }

    // On reconnect we may have missed events, so rejoin and refetch.
    function join() {
      socket.emit('show:join', showId)
      queryClient.invalidateQueries({ queryKey })
    }

    socket.emit('show:join', showId)
    socket.on('connect', join)
    socket.on('seats:changed', patchSeats)

    return () => {
      socket.emit('show:leave', showId)
      socket.off('connect', join)
      socket.off('seats:changed', patchSeats)
    }
  }, [showId, queryClient])
}
