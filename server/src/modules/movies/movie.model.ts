import { Schema, model, type Types } from "mongoose";

export interface Movie {
  _id: Types.ObjectId;
  title: string;
  durationMinutes: number;
  genres: string[];
  language: string;
  rating: string;
  description: string;
  posterColor: string;
}

const movieSchema = new Schema<Movie>({
  title: { type: String, required: true, trim: true, unique: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  genres: { type: [String], default: [] },
  language: { type: String, required: true },
  rating: { type: String, required: true },
  description: { type: String, default: "" },
  posterColor: { type: String, default: "#0F766E" },
});

export const MovieModel = model<Movie>("Movie", movieSchema);

export function toMovieView(movie: Movie) {
  return {
    id: movie._id.toString(),
    title: movie.title,
    durationMinutes: movie.durationMinutes,
    genres: movie.genres,
    language: movie.language,
    rating: movie.rating,
    description: movie.description,
    posterColor: movie.posterColor,
  };
}
