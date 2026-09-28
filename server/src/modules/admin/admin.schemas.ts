import { z } from "zod";

export const cinemaSchema = z.object({
  name: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(3).max(200),
});

export const screenSchema = z.object({
  cinemaId: z.string().min(1, "Cinema is required"),
  name: z.string().trim().min(1).max(40),
  rows: z.number().int().min(1).max(26),
  seatsPerRow: z.number().int().min(1).max(40),
  premiumRows: z.array(z.string().regex(/^[A-Z]$/, "Row letters must be A to Z")).default([]),
});

export const movieSchema = z.object({
  title: z.string().trim().min(1).max(120),
  durationMinutes: z.number().int().min(1).max(600),
  genres: z.array(z.string().trim().min(1)).default([]),
  language: z.string().trim().min(1).max(40),
  rating: z.string().trim().min(1).max(10),
  description: z.string().trim().max(2000).default(""),
  posterColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #0F766E").default("#0F766E"),
});

export const showSchema = z.object({
  movieId: z.string().min(1, "Movie is required"),
  screenId: z.string().min(1, "Screen is required"),
  startsAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), "Show time must be in the future"),
  prices: z.object({
    standard: z.number().int().min(0),
    premium: z.number().int().min(0),
  }),
});

export const screenFiltersSchema = z.object({
  cinemaId: z.string().optional(),
});
