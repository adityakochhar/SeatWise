import { io, type Socket } from 'socket.io-client'
import { apiOrigin } from '@/api/client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) socket = io(apiOrigin)
  return socket
}
