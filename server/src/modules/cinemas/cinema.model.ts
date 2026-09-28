import { Schema, model, type Types } from "mongoose";

export interface Cinema {
  _id: Types.ObjectId;
  name: string;
  city: string;
  address: string;
}

const cinemaSchema = new Schema<Cinema>({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
});

cinemaSchema.index({ city: 1, name: 1 }, { unique: true });

export const CinemaModel = model<Cinema>("Cinema", cinemaSchema);

export function toCinemaView(cinema: Cinema) {
  return { id: cinema._id.toString(), name: cinema.name, city: cinema.city, address: cinema.address };
}
