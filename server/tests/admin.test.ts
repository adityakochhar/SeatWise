import request from "supertest";
import { SeatModel } from "../src/modules/shows/seat.model";
import { app, auth, createShowFixture, signUp } from "./helpers";

describe("admin", () => {
  it("blocks regular users from admin routes", async () => {
    const token = await signUp("user@example.com");
    const res = await request(app).get("/api/admin/stats").set(auth(token));
    expect(res.status).toBe(403);
  });

  it("creates a show and generates one seat per position", async () => {
    const token = await signUp("admin@example.com", "admin");
    const { movie, screen } = await createShowFixture();
    const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post("/api/admin/shows")
      .set(auth(token))
      .send({ movieId: movie._id.toString(), screenId: screen._id.toString(), startsAt, prices: { standard: 150, premium: 250 } });

    expect(res.status).toBe(201);
    expect(res.body.totalSeats).toBe(6);
    expect(res.body.availableSeats).toBe(6);
    expect(await SeatModel.countDocuments({ showId: res.body.id })).toBe(6);
  });

  it("refuses an overlapping show on the same screen", async () => {
    const token = await signUp("admin@example.com", "admin");
    const { movie, screen, show } = await createShowFixture();
    const startsAt = new Date(show.startsAt.getTime() + 30 * 60_000).toISOString();

    const res = await request(app)
      .post("/api/admin/shows")
      .set(auth(token))
      .send({ movieId: movie._id.toString(), screenId: screen._id.toString(), startsAt, prices: { standard: 150, premium: 250 } });

    expect(res.status).toBe(409);
  });

  it("reports occupancy for upcoming shows", async () => {
    const admin = await signUp("admin@example.com", "admin");
    const user = await signUp("user@example.com");
    const { show, seats } = await createShowFixture();

    const hold = await request(app)
      .post("/api/bookings/hold")
      .set(auth(user))
      .send({ showId: show._id.toString(), seatIds: [seats[0]._id.toString(), seats[1]._id.toString()] });
    await request(app).post(`/api/bookings/${hold.body.booking.id}/confirm`).set(auth(user));

    const res = await request(app).get("/api/admin/stats").set(auth(admin));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ totalBookings: 1, paidBookings: 1, revenue: 200, upcomingShows: 1 });
    expect(res.body.occupancy[0]).toMatchObject({ booked: 2, total: 6, movieTitle: "Test Movie" });
  });
});
