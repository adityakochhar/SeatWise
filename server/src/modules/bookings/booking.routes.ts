import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { holdSeatsSchema } from "./booking.schemas";
import { cancelBooking, confirmBooking, getBooking, holdSeats, listMyBookings } from "./booking.service";

export const bookingRouter = Router();

bookingRouter.use(requireAuth);

bookingRouter.post(
  "/hold",
  validate(holdSeatsSchema),
  asyncHandler(async (req, res) => {
    const booking = await holdSeats(req.user!.sub, req.body);
    res.status(201).json({ booking });
  }),
);

bookingRouter.post(
  "/:id/confirm",
  asyncHandler(async (req, res) => {
    const booking = await confirmBooking(req.user!.sub, req.params.id);
    res.json({ booking });
  }),
);

bookingRouter.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const booking = await cancelBooking(req.user!.sub, req.params.id);
    res.json({ booking });
  }),
);

bookingRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(await listMyBookings(req.user!.sub));
  }),
);

bookingRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await getBooking(req.user!.sub, req.user!.role, req.params.id));
  }),
);
