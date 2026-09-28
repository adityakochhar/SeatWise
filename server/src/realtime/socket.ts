import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { SeatStatus } from "../modules/shows/seat.model";

interface SeatChange {
  id: string;
  status: SeatStatus;
}

let io: Server | null = null;

export function initRealtime(httpServer: HttpServer, origin: string): Server {
  io = new Server(httpServer, { cors: { origin } });

  io.on("connection", (socket) => {
    socket.on("show:join", (showId: string) => {
      socket.join(roomFor(showId));
    });
    socket.on("show:leave", (showId: string) => {
      socket.leave(roomFor(showId));
    });
  });

  return io;
}

export function emitSeatsChanged(showId: string, seats: SeatChange[]): void {
  io?.to(roomFor(showId)).emit("seats:changed", { showId, seats });
}

function roomFor(showId: string): string {
  return `show:${showId}`;
}
