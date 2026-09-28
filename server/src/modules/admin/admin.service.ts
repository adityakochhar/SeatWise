import type { Types } from "mongoose";
import { BookingModel } from "../bookings/booking.model";
import { CinemaModel } from "../cinemas/cinema.model";
import { MovieModel } from "../movies/movie.model";
import { SeatModel } from "../shows/seat.model";
import { ShowModel } from "../shows/show.model";

export interface AdminStats {
  totalBookings: number;
  paidBookings: number;
  revenue: number;
  upcomingShows: number;
  occupancy: Array<{
    showId: string;
    movieTitle: string;
    cinemaName: string;
    startsAt: Date;
    booked: number;
    total: number;
  }>;
}

export async function getStats(): Promise<AdminStats> {
  const now = new Date();
  const [totalBookings, paidBookings, revenueRows, upcomingShows, nextShows] = await Promise.all([
    BookingModel.countDocuments(),
    BookingModel.countDocuments({ status: "paid" }),
    BookingModel.aggregate<{ total: number }>([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    ShowModel.countDocuments({ startsAt: { $gte: now } }),
    ShowModel.find({ startsAt: { $gte: now } }).sort({ startsAt: 1 }).limit(20),
  ]);

  const showIds = nextShows.map((s) => s._id);
  const [bookedRows, movies, cinemas] = await Promise.all([
    SeatModel.aggregate<{ _id: Types.ObjectId; booked: number }>([
      { $match: { showId: { $in: showIds }, status: "booked" } },
      { $group: { _id: "$showId", booked: { $sum: 1 } } },
    ]),
    MovieModel.find({ _id: { $in: nextShows.map((s) => s.movieId) } }),
    CinemaModel.find({ _id: { $in: nextShows.map((s) => s.cinemaId) } }),
  ]);

  const bookedByShow = new Map(bookedRows.map((r) => [r._id.toString(), r.booked]));
  const movieTitle = new Map(movies.map((m) => [m._id.toString(), m.title]));
  const cinemaName = new Map(cinemas.map((c) => [c._id.toString(), c.name]));

  return {
    totalBookings,
    paidBookings,
    revenue: revenueRows[0]?.total ?? 0,
    upcomingShows,
    occupancy: nextShows.map((show) => ({
      showId: show._id.toString(),
      movieTitle: movieTitle.get(show.movieId.toString()) ?? "Unknown movie",
      cinemaName: cinemaName.get(show.cinemaId.toString()) ?? "Unknown cinema",
      startsAt: show.startsAt,
      booked: bookedByShow.get(show._id.toString()) ?? 0,
      total: show.totalSeats,
    })),
  };
}
