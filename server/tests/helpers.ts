import request from "supertest";
import { createApp } from "../src/app";
import { CinemaModel } from "../src/modules/cinemas/cinema.model";
import { ScreenModel } from "../src/modules/cinemas/screen.model";
import { MovieModel } from "../src/modules/movies/movie.model";
import { SeatModel } from "../src/modules/shows/seat.model";
import { ShowModel } from "../src/modules/shows/show.model";
import { buildSeats } from "../src/modules/shows/show.service";
import { UserModel } from "../src/modules/users/user.model";

export const app = createApp();

export async function signUp(email: string, role: "user" | "admin" = "user"): Promise<string> {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test Person", email, password: "password123" });
  if (role === "admin") {
    await UserModel.updateOne({ email }, { role: "admin" });
    const login = await request(app).post("/api/auth/login").send({ email, password: "password123" });
    return login.body.token as string;
  }
  return res.body.token as string;
}

export async function createShowFixture(startsAt = new Date(Date.now() + 60 * 60 * 1000)) {
  const cinema = await CinemaModel.create({ name: "Test Cinema", city: "Testville", address: "1 Main St" });
  const screen = await ScreenModel.create({ cinemaId: cinema._id, name: "Audi 1", rows: 2, seatsPerRow: 3, premiumRows: ["B"] });
  const movie = await MovieModel.create({ title: "Test Movie", durationMinutes: 100, language: "English", rating: "UA" });
  const show = await ShowModel.create({
    movieId: movie._id,
    screenId: screen._id,
    cinemaId: cinema._id,
    startsAt,
    endsAt: new Date(startsAt.getTime() + 100 * 60_000),
    prices: { standard: 100, premium: 200 },
    totalSeats: 6,
  });
  await SeatModel.insertMany(buildSeats(show._id, screen));
  const seats = await SeatModel.find({ showId: show._id }).sort({ row: 1, number: 1 });
  return { cinema, screen, movie, show, seats };
}

export function auth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
