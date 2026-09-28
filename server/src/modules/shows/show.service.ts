import { Types } from "mongoose";
import { ApiError } from "../../lib/api-error";
import { toObjectId } from "../../lib/ids";
import { CinemaModel, type Cinema } from "../cinemas/cinema.model";
import { ScreenModel, type Screen } from "../cinemas/screen.model";
import { MovieModel, type Movie } from "../movies/movie.model";
import { SeatModel, toSeatView, type SeatType, type SeatView } from "./seat.model";
import { ShowModel, type Show, type ShowPrices } from "./show.model";

export interface ShowSummary {
  id: string;
  startsAt: Date;
  endsAt: Date;
  prices: ShowPrices;
  movie: { id: string; title: string; durationMinutes: number; rating: string };
  cinema: { id: string; name: string; city: string };
  screen: { id: string; name: string };
  availableSeats: number;
  totalSeats: number;
}

export interface ShowFilters {
  movieId?: string;
  city?: string;
  date?: string;
}

export interface CreateShowInput {
  movieId: string;
  screenId: string;
  startsAt: Date;
  prices: ShowPrices;
}

export async function listShows(filters: ShowFilters): Promise<ShowSummary[]> {
  const query: Record<string, unknown> = {};

  if (filters.movieId) {
    query.movieId = toObjectId(filters.movieId, "movie id");
  }
  if (filters.city) {
    const cinemaIds = await CinemaModel.find({ city: filters.city }).distinct("_id");
    query.cinemaId = { $in: cinemaIds };
  }
  if (filters.date) {
    const { start, end } = dayRange(filters.date);
    query.startsAt = { $gte: start, $lt: end };
  } else {
    query.startsAt = { $gte: new Date() };
  }

  const shows = await ShowModel.find(query).sort({ startsAt: 1 });
  return summarise(shows);
}

export async function getShow(showId: string): Promise<ShowSummary> {
  const show = await ShowModel.findById(toObjectId(showId, "show id"));
  if (!show) {
    throw ApiError.notFound("Show not found.");
  }
  const [summary] = await summarise([show]);
  return summary;
}

export async function getSeats(showId: string): Promise<SeatView[]> {
  const id = toObjectId(showId, "show id");
  const exists = await ShowModel.exists({ _id: id });
  if (!exists) {
    throw ApiError.notFound("Show not found.");
  }
  const now = new Date();
  const seats = await SeatModel.find({ showId: id }).sort({ row: 1, number: 1 });
  return seats.map((seat) => toSeatView(seat, now));
}

export async function createShow(input: CreateShowInput): Promise<ShowSummary> {
  const movie = await MovieModel.findById(toObjectId(input.movieId, "movie id"));
  if (!movie) {
    throw ApiError.notFound("Movie not found.");
  }
  const screen = await ScreenModel.findById(toObjectId(input.screenId, "screen id"));
  if (!screen) {
    throw ApiError.notFound("Screen not found.");
  }

  const startsAt = input.startsAt;
  const endsAt = new Date(startsAt.getTime() + movie.durationMinutes * 60_000);

  const overlapping = await ShowModel.exists({
    screenId: screen._id,
    startsAt: { $lt: endsAt },
    endsAt: { $gt: startsAt },
  });
  if (overlapping) {
    throw ApiError.conflict("Another show is already scheduled on this screen at that time.");
  }

  const show = await ShowModel.create({
    movieId: movie._id,
    screenId: screen._id,
    cinemaId: screen.cinemaId,
    startsAt,
    endsAt,
    prices: input.prices,
    totalSeats: screen.rows * screen.seatsPerRow,
  });

  await SeatModel.insertMany(buildSeats(show._id, screen));

  const [summary] = await summarise([show]);
  return summary;
}

export function buildSeats(showId: Types.ObjectId, screen: Screen) {
  const seats = [];
  for (let r = 0; r < screen.rows; r++) {
    const row = String.fromCharCode(65 + r);
    const type: SeatType = screen.premiumRows.includes(row) ? "premium" : "standard";
    for (let n = 1; n <= screen.seatsPerRow; n++) {
      seats.push({ showId, row, number: n, label: `${row}${n}`, type, status: "available" as const });
    }
  }
  return seats;
}

async function summarise(shows: Show[]): Promise<ShowSummary[]> {
  if (shows.length === 0) return [];

  const showIds = shows.map((s) => s._id);
  const [movies, cinemas, screens, availability] = await Promise.all([
    MovieModel.find({ _id: { $in: shows.map((s) => s.movieId) } }),
    CinemaModel.find({ _id: { $in: shows.map((s) => s.cinemaId) } }),
    ScreenModel.find({ _id: { $in: shows.map((s) => s.screenId) } }),
    countAvailableSeats(showIds),
  ]);

  const movieById = indexById(movies);
  const cinemaById = indexById(cinemas);
  const screenById = indexById(screens);

  return shows.map((show) => {
    const movie = movieById.get(show.movieId.toString());
    const cinema = cinemaById.get(show.cinemaId.toString());
    const screen = screenById.get(show.screenId.toString());
    if (!movie || !cinema || !screen) {
      throw new Error(`Show ${show._id} references a missing movie, cinema or screen`);
    }
    return toShowSummary(show, movie, cinema, screen, availability.get(show._id.toString()) ?? 0);
  });
}

function toShowSummary(
  show: Show,
  movie: Movie,
  cinema: Cinema,
  screen: Screen,
  availableSeats: number,
): ShowSummary {
  return {
    id: show._id.toString(),
    startsAt: show.startsAt,
    endsAt: show.endsAt,
    prices: show.prices,
    movie: { id: movie._id.toString(), title: movie.title, durationMinutes: movie.durationMinutes, rating: movie.rating },
    cinema: { id: cinema._id.toString(), name: cinema.name, city: cinema.city },
    screen: { id: screen._id.toString(), name: screen.name },
    availableSeats,
    totalSeats: show.totalSeats,
  };
}

async function countAvailableSeats(showIds: Types.ObjectId[]): Promise<Map<string, number>> {
  const now = new Date();
  const rows = await SeatModel.aggregate<{ _id: Types.ObjectId; available: number }>([
    { $match: { showId: { $in: showIds } } },
    {
      $group: {
        _id: "$showId",
        available: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$status", "available"] },
                  { $and: [{ $eq: ["$status", "held"] }, { $lt: ["$lockedUntil", now] }] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);
  return new Map(rows.map((row) => [row._id.toString(), row.available]));
}

function indexById<T extends { _id: Types.ObjectId }>(docs: T[]): Map<string, T> {
  return new Map(docs.map((doc) => [doc._id.toString(), doc]));
}

// Dates arrive as YYYY-MM-DD and are read in the server's timezone (TZ env).
function dayRange(date: string): { start: Date; end: Date } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw ApiError.badRequest("Date must be in YYYY-MM-DD format.");
  }
  const start = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}
