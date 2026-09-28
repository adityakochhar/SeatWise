import { Schema, model, type Types } from "mongoose";

export interface ShowPrices {
  standard: number;
  premium: number;
}

export interface Show {
  _id: Types.ObjectId;
  movieId: Types.ObjectId;
  screenId: Types.ObjectId;
  cinemaId: Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  prices: ShowPrices;
  totalSeats: number;
}

const showSchema = new Schema<Show>({
  movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
  screenId: { type: Schema.Types.ObjectId, ref: "Screen", required: true, index: true },
  cinemaId: { type: Schema.Types.ObjectId, ref: "Cinema", required: true, index: true },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
  prices: {
    standard: { type: Number, required: true, min: 0 },
    premium: { type: Number, required: true, min: 0 },
  },
  totalSeats: { type: Number, required: true },
});

export const ShowModel = model<Show>("Show", showSchema);
