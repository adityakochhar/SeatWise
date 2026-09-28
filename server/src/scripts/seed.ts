import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/db";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { BookingModel } from "../modules/bookings/booking.model";
import { CinemaModel } from "../modules/cinemas/cinema.model";
import { ScreenModel } from "../modules/cinemas/screen.model";
import { MovieModel } from "../modules/movies/movie.model";
import { SeatModel } from "../modules/shows/seat.model";
import { ShowModel } from "../modules/shows/show.model";
import { buildSeats } from "../modules/shows/show.service";
import { UserModel } from "../modules/users/user.model";

const cinemas = [
  { name: "Elante Cinemas", city: "Chandigarh", address: "Elante Mall, Industrial Area Phase 1" },
  { name: "Piccadily Square", city: "Chandigarh", address: "Sector 34A" },
  { name: "Bestech Cinemas", city: "Mohali", address: "Bestech Square, Sector 66" },
];

const movies = [
  { title: "Monsoon Express", durationMinutes: 132, genres: ["Drama", "Romance"], language: "Hindi", rating: "UA", posterColor: "#0F766E", description: "Two strangers share a train compartment on the longest night of the monsoon." },
  { title: "Kernel Panic", durationMinutes: 118, genres: ["Thriller", "Sci-Fi"], language: "English", rating: "A", posterColor: "#1D4ED8", description: "A systems engineer discovers the outage she is fixing was designed to hide something." },
  { title: "Dhoop", durationMinutes: 141, genres: ["Drama"], language: "Punjabi", rating: "U", posterColor: "#B45309", description: "A wheat farmer's last harvest before the land is sold." },
  { title: "Night Market", durationMinutes: 104, genres: ["Comedy"], language: "Hindi", rating: "UA", posterColor: "#7C3AED", description: "Four cousins try to run a food stall for one night without telling their grandmother." },
  { title: "Deep Field", durationMinutes: 156, genres: ["Sci-Fi", "Adventure"], language: "English", rating: "UA", posterColor: "#0369A1", description: "A telescope crew receives a signal that is already thirty years old." },
  { title: "Chauraha", durationMinutes: 127, genres: ["Action", "Crime"], language: "Hindi", rating: "A", posterColor: "#B91C1C", description: "One intersection, four gangs, and a traffic constable who refuses to look away." },
];

const showTimes = [
  { hour: 10, minute: 30 },
  { hour: 14, minute: 15 },
  { hour: 19, minute: 0 },
];

async function seed(): Promise<void> {
  await connectDatabase(env.mongoUri);

  await Promise.all([
    UserModel.deleteMany({}),
    CinemaModel.deleteMany({}),
    ScreenModel.deleteMany({}),
    MovieModel.deleteMany({}),
    ShowModel.deleteMany({}),
    SeatModel.deleteMany({}),
    BookingModel.deleteMany({}),
  ]);

  await UserModel.create([
    { name: "Admin", email: "admin@seatwise.dev", passwordHash: await bcrypt.hash("Admin@123", 10), role: "admin" },
    { name: "Demo User", email: "demo@seatwise.dev", passwordHash: await bcrypt.hash("Demo@123", 10), role: "user" },
  ]);

  const savedCinemas = await CinemaModel.create(cinemas);
  const savedMovies = await MovieModel.create(movies);

  const screens = [];
  for (const cinema of savedCinemas) {
    screens.push(
      { cinemaId: cinema._id, name: "Audi 1", rows: 8, seatsPerRow: 12, premiumRows: ["G", "H"] },
      { cinemaId: cinema._id, name: "Audi 2", rows: 6, seatsPerRow: 10, premiumRows: ["F"] },
    );
  }
  const savedScreens = await ScreenModel.create(screens);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let showCount = 0;
  let movieIndex = 0;
  for (let day = 0; day < 5; day++) {
    for (const screen of savedScreens) {
      for (const time of showTimes) {
        const movie = savedMovies[movieIndex % savedMovies.length];
        movieIndex++;

        const startsAt = new Date(today);
        startsAt.setDate(today.getDate() + day);
        startsAt.setHours(time.hour, time.minute, 0, 0);
        if (startsAt < new Date()) continue;

        const show = await ShowModel.create({
          movieId: movie._id,
          screenId: screen._id,
          cinemaId: screen.cinemaId,
          startsAt,
          endsAt: new Date(startsAt.getTime() + movie.durationMinutes * 60_000),
          prices: { standard: 180, premium: 320 },
          totalSeats: screen.rows * screen.seatsPerRow,
        });
        await SeatModel.insertMany(buildSeats(show._id, screen));
        showCount++;
      }
    }
  }

  logger.info(`Seeded ${savedCinemas.length} cinemas, ${savedScreens.length} screens, ${savedMovies.length} movies, ${showCount} shows`);
  logger.info("Admin login: admin@seatwise.dev / Admin@123");
  logger.info("User login:  demo@seatwise.dev / Demo@123");

  await disconnectDatabase();
}

seed().catch((err) => {
  logger.error("Seed failed", err);
  process.exit(1);
});
