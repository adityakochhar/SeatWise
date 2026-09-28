import { Schema, model, type Types } from "mongoose";

export interface Screen {
  _id: Types.ObjectId;
  cinemaId: Types.ObjectId;
  name: string;
  rows: number;
  seatsPerRow: number;
  premiumRows: string[];
}

const screenSchema = new Schema<Screen>({
  cinemaId: { type: Schema.Types.ObjectId, ref: "Cinema", required: true, index: true },
  name: { type: String, required: true, trim: true },
  rows: { type: Number, required: true, min: 1, max: 26 },
  seatsPerRow: { type: Number, required: true, min: 1, max: 40 },
  premiumRows: { type: [String], default: [] },
});

screenSchema.index({ cinemaId: 1, name: 1 }, { unique: true });

export const ScreenModel = model<Screen>("Screen", screenSchema);

export function toScreenView(screen: Screen) {
  return {
    id: screen._id.toString(),
    cinemaId: screen.cinemaId.toString(),
    name: screen.name,
    rows: screen.rows,
    seatsPerRow: screen.seatsPerRow,
    premiumRows: screen.premiumRows,
  };
}
