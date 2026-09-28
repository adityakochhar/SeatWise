import { randomBytes } from "node:crypto";
import { Types, type HydratedDocument } from "mongoose";
import { env } from "../../config/env";
import { ApiError } from "../../lib/api-error";
import { toObjectId } from "../../lib/ids";
import { emitSeatsChanged } from "../../realtime/socket";
import { CinemaModel } from "../cinemas/cinema.model";
import { ScreenModel } from "../cinemas/screen.model";
import { MovieModel } from "../movies/movie.model";
import { SeatModel, type SeatStatus } from "../shows/seat.model";
import { ShowModel, type Show } from "../shows/show.model";
import { BookingModel, type Booking, type BookingStatus } from "./booking.model";
import type { HoldSeatsInput } from "./booking.schemas";

export interface BookingView {
  id: string;
  status: BookingStatus;
  amount: number;
  seatLabels: string[];
  expiresAt: Date;
  paidAt: Date | null;
  code: string | null;
  show: {
    id: string;
    startsAt: Date;
    movie: { id: string; title: string };
    cinema: { id: string; name: string; city: string };
    screen: { id: string; name: string };
  };
}

export async function holdSeats(userId: string, input: HoldSeatsInput): Promise<BookingView> {
  const showId = toObjectId(input.showId, "show id");
  const seatIds = [...new Set(input.seatIds)].map((id) => toObjectId(id, "seat id"));

  const show = await ShowModel.findById(showId);
  if (!show) {
    throw ApiError.notFound("Show not found.");
  }
  if (show.startsAt < new Date()) {
    throw ApiError.conflict("This show has already started.");
  }

  const seats = await SeatModel.find({ _id: { $in: seatIds }, showId });
  if (seats.length !== seatIds.length) {
    throw ApiError.badRequest("Some of those seats do not belong to this show.");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.holdMinutes * 60_000);
  const booking = await BookingModel.create({
    userId: toObjectId(userId, "user id"),
    showId,
    seatIds,
    seatLabels: seats.map((s) => s.label),
    amount: seats.reduce((sum, seat) => sum + show.prices[seat.type], 0),
    status: "pending",
    expiresAt,
  });

  // Each seat is claimed with one conditional update. Two users clicking the
  // same seat at the same moment both reach MongoDB, but only the first
  // matching filter wins; the second gets null and we report it as taken.
  const taken: Types.ObjectId[] = [];
  const lost: string[] = [];
  for (const seat of seats) {
    const claimed = await SeatModel.findOneAndUpdate(
      {
        _id: seat._id,
        showId,
        $or: [{ status: "available" }, { status: "held", lockedUntil: { $lt: now } }],
      },
      { $set: { status: "held", bookingId: booking._id, lockedUntil: expiresAt } },
      { new: true },
    );
    if (claimed) {
      taken.push(claimed._id);
    } else {
      lost.push(seat.label);
    }
  }

  if (lost.length > 0) {
    await releaseSeats(booking._id);
    await BookingModel.deleteOne({ _id: booking._id });
    notifySeatChange(showId, taken, "available");
    throw ApiError.conflict("Some seats were just taken.", { unavailable: lost });
  }

  notifySeatChange(showId, taken, "held");
  return loadBookingView(booking);
}

export async function confirmBooking(userId: string, bookingId: string): Promise<BookingView> {
  const booking = await findOwnedBooking(userId, bookingId);
  if (booking.status !== "pending") {
    throw ApiError.conflict(`This booking is already ${booking.status}.`);
  }
  if (booking.expiresAt < new Date()) {
    await expireBooking(booking);
    throw ApiError.conflict("Your hold has expired. Please pick your seats again.");
  }

  const result = await SeatModel.updateMany(
    { _id: { $in: booking.seatIds }, status: "held", bookingId: booking._id },
    { $set: { status: "booked", lockedUntil: null } },
  );
  if (result.modifiedCount !== booking.seatIds.length) {
    await expireBooking(booking);
    throw ApiError.conflict("Your hold has expired. Please pick your seats again.");
  }

  booking.status = "paid";
  booking.paidAt = new Date();
  booking.code = ticketCode();
  await booking.save();

  notifySeatChange(booking.showId, booking.seatIds, "booked");
  return loadBookingView(booking);
}

export async function cancelBooking(userId: string, bookingId: string): Promise<BookingView> {
  const booking = await findOwnedBooking(userId, bookingId);
  if (booking.status !== "pending") {
    throw ApiError.conflict("Only a pending booking can be released.");
  }
  await releaseSeats(booking._id);
  booking.status = "cancelled";
  await booking.save();
  notifySeatChange(booking.showId, booking.seatIds, "available");
  return loadBookingView(booking);
}

export async function listMyBookings(userId: string): Promise<BookingView[]> {
  const bookings = await BookingModel.find({ userId: toObjectId(userId, "user id") }).sort({ createdAt: -1 });
  return Promise.all(bookings.map((booking) => loadBookingView(booking)));
}

export async function getBooking(userId: string, role: string, bookingId: string): Promise<BookingView> {
  const booking = await BookingModel.findById(toObjectId(bookingId, "booking id"));
  if (!booking) {
    throw ApiError.notFound("Booking not found.");
  }
  if (booking.userId.toString() !== userId && role !== "admin") {
    throw ApiError.forbidden();
  }
  return loadBookingView(booking);
}

export async function expireStaleHolds(): Promise<number> {
  const stale = await BookingModel.find({ status: "pending", expiresAt: { $lt: new Date() } });
  for (const booking of stale) {
    await expireBooking(booking);
  }
  return stale.length;
}

async function expireBooking(booking: HydratedDocument<Booking>): Promise<void> {
  await releaseSeats(booking._id);
  booking.status = "expired";
  await booking.save();
  notifySeatChange(booking.showId, booking.seatIds, "available");
}

async function releaseSeats(bookingId: Types.ObjectId): Promise<void> {
  await SeatModel.updateMany(
    { bookingId, status: "held" },
    { $set: { status: "available", bookingId: null, lockedUntil: null } },
  );
}

async function findOwnedBooking(userId: string, bookingId: string): Promise<HydratedDocument<Booking>> {
  const booking = await BookingModel.findById(toObjectId(bookingId, "booking id"));
  if (!booking) {
    throw ApiError.notFound("Booking not found.");
  }
  if (booking.userId.toString() !== userId) {
    throw ApiError.forbidden();
  }
  return booking;
}

function notifySeatChange(showId: Types.ObjectId, seatIds: Types.ObjectId[], status: SeatStatus): void {
  if (seatIds.length === 0) return;
  emitSeatsChanged(
    showId.toString(),
    seatIds.map((id) => ({ id: id.toString(), status })),
  );
}

function ticketCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function loadBookingView(booking: Booking): Promise<BookingView> {
  const show = await ShowModel.findById(booking.showId);
  if (!show) {
    throw new Error(`Booking ${booking._id} references a missing show`);
  }
  const [movie, cinema, screen] = await Promise.all([
    MovieModel.findById(show.movieId),
    CinemaModel.findById(show.cinemaId),
    ScreenModel.findById(show.screenId),
  ]);
  if (!movie || !cinema || !screen) {
    throw new Error(`Show ${show._id} references a missing movie, cinema or screen`);
  }
  return toBookingView(booking, show, {
    movie: { id: movie._id.toString(), title: movie.title },
    cinema: { id: cinema._id.toString(), name: cinema.name, city: cinema.city },
    screen: { id: screen._id.toString(), name: screen.name },
  });
}

function toBookingView(booking: Booking, show: Show, refs: Omit<BookingView["show"], "id" | "startsAt">): BookingView {
  return {
    id: booking._id.toString(),
    status: booking.status,
    amount: booking.amount,
    seatLabels: booking.seatLabels,
    expiresAt: booking.expiresAt,
    paidAt: booking.paidAt ?? null,
    code: booking.code ?? null,
    show: { id: show._id.toString(), startsAt: show.startsAt, ...refs },
  };
}
