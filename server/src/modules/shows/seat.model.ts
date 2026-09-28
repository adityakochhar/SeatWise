import { Schema, model, type Types } from "mongoose";

export type SeatType = "standard" | "premium";
export type SeatStatus = "available" | "held" | "booked";

export interface Seat {
  _id: Types.ObjectId;
  showId: Types.ObjectId;
  row: string;
  number: number;
  label: string;
  type: SeatType;
  status: SeatStatus;
  bookingId?: Types.ObjectId | null;
  lockedUntil?: Date | null;
}

export interface SeatView {
  id: string;
  row: string;
  number: number;
  label: string;
  type: SeatType;
  status: SeatStatus;
}

const seatSchema = new Schema<Seat>({
  showId: { type: Schema.Types.ObjectId, ref: "Show", required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ["standard", "premium"], required: true },
  status: { type: String, enum: ["available", "held", "booked"], default: "available" },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
  lockedUntil: { type: Date, default: null },
});

seatSchema.index({ showId: 1, row: 1, number: 1 }, { unique: true });
seatSchema.index({ showId: 1, status: 1 });

export const SeatModel = model<Seat>("Seat", seatSchema);

function effectiveStatus(seat: Seat, now: Date): SeatStatus {
  if (seat.status === "held" && seat.lockedUntil && seat.lockedUntil < now) {
    return "available";
  }
  return seat.status;
}

export function toSeatView(seat: Seat, now: Date): SeatView {
  return {
    id: seat._id.toString(),
    row: seat.row,
    number: seat.number,
    label: seat.label,
    type: seat.type,
    status: effectiveStatus(seat, now),
  };
}
