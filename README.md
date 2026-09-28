# SeatWise

Cinema seat booking with live seat availability. Pick a city, choose a show, select seats on a seat map, hold them for five minutes while you pay, and get a ticket code. Other people looking at the same show see your seats go grey the moment you hold them.

Built as a single repository with a React + TypeScript frontend and an Express + TypeScript backend on MongoDB.

**Demo logins** (after seeding)

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@seatwise.dev   | Admin@123 |
| User  | demo@seatwise.dev    | Demo@123  |

## What it does

- Browse movies by city and date, grouped by cinema, with live seat counts on each show time.
- Interactive seat map with standard and premium rows, up to six seats per booking.
- Seats are held for five minutes. The checkout page counts down; if time runs out the seats go back on sale.
- Payment is simulated. The confirm step is where a real gateway would go.
- Live updates over Socket.IO: holds, bookings, releases and expiries push to everyone viewing that show.
- Admin area: add cinemas, screens, movies and shows; see occupancy and revenue.
- 19 API tests, including one that fires two requests for the same seat at the same moment and checks that exactly one wins.

## The interesting part: two people, one seat

A booking site fails in exactly one place: two people click the same seat within a few milliseconds. Reading the seat and then writing it leaves a gap where both requests see "available".

SeatWise never reads then writes. Claiming a seat is a single conditional update that only matches if the seat is still free:

```ts
const claimed = await SeatModel.findOneAndUpdate(
  {
    _id: seat._id,
    showId,
    $or: [{ status: "available" }, { status: "held", lockedUntil: { $lt: now } }],
  },
  { $set: { status: "held", bookingId: booking._id, lockedUntil: expiresAt } },
  { new: true },
);
```

MongoDB serialises writes to one document, so the first request matches and the second gets `null`. The loser receives `409 Conflict` with the seat labels it lost, and any seats it did manage to take are released. Confirming a booking works the same way: an `updateMany` that only matches seats still held by that booking, so an expired hold can never be paid for.

See `server/src/modules/bookings/booking.service.ts` and the test `lets exactly one of two simultaneous requests win the same seat` in `server/tests/bookings.test.ts`.

## Running it

### With Docker

```bash
docker compose up --build
```

Then seed the database once:

```bash
docker compose exec api node dist/scripts/seed.js
```

Open http://localhost:8080.

### Without Docker

You need Node 18+ and a MongoDB you can reach (local install or an Atlas connection string).

```bash
# API
cd server
cp .env.example .env        # edit MONGO_URI and JWT_SECRET
npm install
npm run seed
npm run dev                 # http://localhost:4000

# Web (second terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

### Tests

```bash
cd server
npm test
```

The tests spin up an in-memory MongoDB, so nothing needs to be running.

## Project layout

```
seat-booking/
├── client/                     React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── App.tsx             routes
│       ├── api/                fetch wrapper (client.ts) and one file per API area
│       ├── auth/               AuthProvider, useAuth, RequireAuth, RequireAdmin
│       ├── components/
│       │   ├── layout/         AppShell, Navbar, Container, Footer
│       │   ├── ui/             Button, Input, Select, Field, Badge, Spinner, ...
│       │   ├── seats/          SeatMap, Seat, SeatLegend, SelectionSummary
│       │   ├── movies/         MovieCard, PosterTile, ShowTimeChip
│       │   └── bookings/       BookingCard, BookingSummary, HoldCountdown
│       ├── pages/              one file per route; admin/ holds the admin page and its forms
│       ├── realtime/           socket client and useShowSeatsLive
│       ├── hooks/              useCountdown, useFormFields, useQueryParam
│       ├── lib/                formatting, validation, query keys
│       └── types/api.ts        response types shared by every page
├── server/                     Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── app.ts              express app, routers, error handling
│   │   ├── server.ts           http server, socket.io, background job
│   │   ├── config/             env, database
│   │   ├── middleware/         auth, validation, error handler
│   │   ├── modules/            auth, users, cinemas, movies, shows, bookings, admin, catalogue
│   │   │   └── <module>/       model, service, routes, schemas
│   │   ├── realtime/           socket.io setup and emitters
│   │   ├── jobs/               hold expiry sweeper
│   │   └── scripts/seed.ts
│   └── tests/                  jest + supertest + mongodb-memory-server
├── docker-compose.yml
└── .github/workflows/ci.yml    typecheck, test and build on every push
```

Each backend module is split the same way: `*.model.ts` (Mongoose schema and a `toView` mapper), `*.schemas.ts` (Zod input validation), `*.service.ts` (the logic), `*.routes.ts` (thin Express handlers). Nothing in a route file touches the database directly.

## API

All routes are under `/api`. Errors always look like `{ "message": "...", "details": ... }`.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /auth/register | – | create account |
| POST | /auth/login | – | get a JWT |
| GET | /auth/me | user | current profile |
| GET | /cities | – | cities that have cinemas |
| GET | /movies, /movies/:id | – | catalogue |
| GET | /shows?movieId&city&date | – | shows with available seat counts |
| GET | /shows/:id/seats | – | seat map for a show |
| POST | /bookings/hold | user | hold up to 6 seats for 5 minutes |
| POST | /bookings/:id/confirm | user | simulated payment, books the seats |
| POST | /bookings/:id/cancel | user | release a pending hold |
| GET | /bookings/me | user | my bookings |
| POST | /admin/cinemas, /admin/screens, /admin/movies, /admin/shows | admin | manage the catalogue |
| GET | /admin/stats | admin | bookings, revenue, occupancy |

Socket events: the client emits `show:join` / `show:leave` with a show id; the server emits `seats:changed` with `{ showId, seats: [{ id, status }] }`.

## Data model

```
User      name, email, passwordHash, role
Cinema    name, city, address
Screen    cinemaId, name, rows, seatsPerRow, premiumRows[]
Movie     title, durationMinutes, genres[], language, rating, description, posterColor
Show      movieId, screenId, cinemaId, startsAt, endsAt, prices{standard,premium}, totalSeats
Seat      showId, row, number, label, type, status, bookingId, lockedUntil     unique (showId,row,number)
Booking   userId, showId, seatIds[], seatLabels[], amount, status, expiresAt, paidAt, code
```

Seats are created per show when the show is created, one document each. That is more documents than a bitmap, but it makes the atomic claim trivial and lets the seat map query stay a plain `find`.

## Decisions and trade-offs

- **Hold expiry is a timestamp, not a timer.** A seat with `lockedUntil` in the past is treated as available by every read and every claim. A background job also sweeps expired holds every 30 seconds so the seat map and bookings list stay accurate. If the server restarts, nothing is lost.
- **Holds are claimed one seat at a time** rather than in a transaction. Partial failure is handled by releasing what was taken and reporting exactly which seats were lost, which is a better message for the user than a generic rollback.
- **Role lives in the JWT** for a 7-day token. Simple for this scope; a real deployment would add refresh tokens or check the role against the database on admin routes.
- **Dates are interpreted in the server's timezone.** Set `TZ=Asia/Kolkata` (done in docker-compose) so a show at 10:30 shows up on the right day.
- **No Redis.** MongoDB's single-document atomicity is enough for the claim. Redis with `SET NX PX` would be the next step if seat claims needed to be faster than a database round trip.

## Environment

`server/.env`

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/seatwise
JWT_SECRET=a-long-random-string
CLIENT_ORIGIN=http://localhost:5173
HOLD_MINUTES=5
```

`client/.env`

```
VITE_API_URL=http://localhost:4000
```
