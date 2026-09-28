import request from "supertest";
import { BookingModel } from "../src/modules/bookings/booking.model";
import { expireStaleHolds } from "../src/modules/bookings/booking.service";
import { SeatModel } from "../src/modules/shows/seat.model";
import { app, auth, createShowFixture, signUp } from "./helpers";

async function seatStatuses(showId: string): Promise<Record<string, string>> {
  const res = await request(app).get(`/api/shows/${showId}/seats`);
  const map: Record<string, string> = {};
  for (const seat of res.body) map[seat.label] = seat.status;
  return map;
}

describe("seat holds", () => {
  it("holds seats and prices them by type", async () => {
    const token = await signUp("a@example.com");
    const { show, seats } = await createShowFixture();
    const [a1, b1] = [seats[0], seats[3]];

    const res = await request(app)
      .post("/api/bookings/hold")
      .set(auth(token))
      .send({ showId: show._id.toString(), seatIds: [a1._id.toString(), b1._id.toString()] });

    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({ status: "pending", amount: 300, seatLabels: ["A1", "B1"] });

    const statuses = await seatStatuses(show._id.toString());
    expect(statuses.A1).toBe("held");
    expect(statuses.B1).toBe("held");
    expect(statuses.A2).toBe("available");
  });

  it("lets exactly one of two simultaneous requests win the same seat", async () => {
    const [tokenA, tokenB] = await Promise.all([signUp("a@example.com"), signUp("b@example.com")]);
    const { show, seats } = await createShowFixture();
    const body = { showId: show._id.toString(), seatIds: [seats[0]._id.toString()] };

    const [resA, resB] = await Promise.all([
      request(app).post("/api/bookings/hold").set(auth(tokenA)).send(body),
      request(app).post("/api/bookings/hold").set(auth(tokenB)).send(body),
    ]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([201, 409]);

    const loser = resA.status === 409 ? resA : resB;
    expect(loser.body.details.unavailable).toEqual(["A1"]);

    expect(await BookingModel.countDocuments()).toBe(1);
  });

  it("releases the seats it did take when one seat in the request is lost", async () => {
    const [tokenA, tokenB] = await Promise.all([signUp("a@example.com"), signUp("b@example.com")]);
    const { show, seats } = await createShowFixture();
    const showId = show._id.toString();

    await request(app)
      .post("/api/bookings/hold")
      .set(auth(tokenA))
      .send({ showId, seatIds: [seats[0]._id.toString()] });

    const res = await request(app)
      .post("/api/bookings/hold")
      .set(auth(tokenB))
      .send({ showId, seatIds: [seats[0]._id.toString(), seats[1]._id.toString()] });

    expect(res.status).toBe(409);
    expect(res.body.details.unavailable).toEqual(["A1"]);

    const statuses = await seatStatuses(showId);
    expect(statuses.A1).toBe("held");
    expect(statuses.A2).toBe("available");
    expect(await BookingModel.countDocuments()).toBe(1);
  });

  it("rejects more than six seats", async () => {
    const token = await signUp("a@example.com");
    const { show, seats } = await createShowFixture();
    const ids = [...seats, ...seats].slice(0, 7).map((s) => s._id.toString());

    const res = await request(app).post("/api/bookings/hold").set(auth(token)).send({ showId: show._id.toString(), seatIds: ids });

    expect(res.status).toBe(400);
  });

  it("treats an expired hold as available to the next person", async () => {
    const [tokenA, tokenB] = await Promise.all([signUp("a@example.com"), signUp("b@example.com")]);
    const { show, seats } = await createShowFixture();
    const body = { showId: show._id.toString(), seatIds: [seats[0]._id.toString()] };

    const first = await request(app).post("/api/bookings/hold").set(auth(tokenA)).send(body);
    expect(first.status).toBe(201);

    await SeatModel.updateOne({ _id: seats[0]._id }, { lockedUntil: new Date(Date.now() - 1000) });

    const second = await request(app).post("/api/bookings/hold").set(auth(tokenB)).send(body);
    expect(second.status).toBe(201);
  });
});

describe("confirm and cancel", () => {
  it("confirms a pending booking, books the seats and issues a code", async () => {
    const token = await signUp("a@example.com");
    const { show, seats } = await createShowFixture();
    const hold = await request(app)
      .post("/api/bookings/hold")
      .set(auth(token))
      .send({ showId: show._id.toString(), seatIds: [seats[0]._id.toString()] });

    const res = await request(app).post(`/api/bookings/${hold.body.booking.id}/confirm`).set(auth(token));

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe("paid");
    expect(res.body.booking.code).toMatch(/^[A-Z0-9]{6}$/);
    expect((await seatStatuses(show._id.toString())).A1).toBe("booked");

    const again = await request(app).post(`/api/bookings/${hold.body.booking.id}/confirm`).set(auth(token));
    expect(again.status).toBe(409);
  });

  it("refuses to confirm once the hold has expired", async () => {
    const token = await signUp("a@example.com");
    const { show, seats } = await createShowFixture();
    const hold = await request(app)
      .post("/api/bookings/hold")
      .set(auth(token))
      .send({ showId: show._id.toString(), seatIds: [seats[0]._id.toString()] });

    await BookingModel.updateOne({ _id: hold.body.booking.id }, { expiresAt: new Date(Date.now() - 1000) });

    const res = await request(app).post(`/api/bookings/${hold.body.booking.id}/confirm`).set(auth(token));
    expect(res.status).toBe(409);

    const booking = await BookingModel.findById(hold.body.booking.id);
    expect(booking?.status).toBe("expired");
    expect((await seatStatuses(show._id.toString())).A1).toBe("available");
  });

  it("cancels a pending booking and frees its seats", async () => {
    const token = await signUp("a@example.com");
    const { show, seats } = await createShowFixture();
    const hold = await request(app)
      .post("/api/bookings/hold")
      .set(auth(token))
      .send({ showId: show._id.toString(), seatIds: [seats[0]._id.toString(), seats[1]._id.toString()] });

    const res = await request(app).post(`/api/bookings/${hold.body.booking.id}/cancel`).set(auth(token));

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe("cancelled");
    const statuses = await seatStatuses(show._id.toString());
    expect(statuses.A1).toBe("available");
    expect(statuses.A2).toBe("available");
  });

  it("does not let another user touch my booking", async () => {
    const [tokenA, tokenB] = await Promise.all([signUp("a@example.com"), signUp("b@example.com")]);
    const { show, seats } = await createShowFixture();
    const hold = await request(app)
      .post("/api/bookings/hold")
      .set(auth(tokenA))
      .send({ showId: show._id.toString(), seatIds: [seats[0]._id.toString()] });

    const res = await request(app).post(`/api/bookings/${hold.body.booking.id}/confirm`).set(auth(tokenB));
    expect(res.status).toBe(403);
  });

  it("sweeps stale holds in the background job", async () => {
    const token = await signUp("a@example.com");
    const { show, seats } = await createShowFixture();
    const hold = await request(app)
      .post("/api/bookings/hold")
      .set(auth(token))
      .send({ showId: show._id.toString(), seatIds: [seats[0]._id.toString()] });
    await BookingModel.updateOne({ _id: hold.body.booking.id }, { expiresAt: new Date(Date.now() - 1000) });

    expect(await expireStaleHolds()).toBe(1);
    expect((await seatStatuses(show._id.toString())).A1).toBe("available");
  });
});
