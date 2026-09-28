import { Schema, model, type Types } from "mongoose";

export type BookingStatus = "pending" | "paid" | "cancelled" | "expired";

export interface Booking {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  showId: Types.ObjectId;
  seatIds: Types.ObjectId[];
  seatLabels: string[];
  amount: number;
  status: BookingStatus;
  expiresAt: Date;
  paidAt?: Date | null;
  code?: string | null;
  createdAt: Date;
}

const bookingSchema = new Schema<Booking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    showId: { type: Schema.Types.ObjectId, ref: "Show", required: true, index: true },
    seatIds: { type: [Schema.Types.ObjectId], required: true },
    seatLabels: { type: [String], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "cancelled", "expired"], default: "pending" },
    expiresAt: { type: Date, required: true },
    paidAt: { type: Date, default: null },
    code: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

bookingSchema.index({ status: 1, expiresAt: 1 });

export const BookingModel = model<Booking>("Booking", bookingSchema);
