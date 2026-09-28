import { Router } from "express";
import { z } from "zod";
import { ApiError } from "../../lib/api-error";
import { asyncHandler } from "../../lib/async-handler";
import { toObjectId } from "../../lib/ids";
import { validate } from "../../middleware/validate";
import { CinemaModel } from "../cinemas/cinema.model";
import { MovieModel, toMovieView } from "../movies/movie.model";
import { getSeats, getShow, listShows } from "../shows/show.service";

export const catalogueRouter = Router();

const showFiltersSchema = z.object({
  movieId: z.string().optional(),
  city: z.string().optional(),
  date: z.string().optional(),
});

catalogueRouter.get(
  "/cities",
  asyncHandler(async (_req, res) => {
    const cities = await CinemaModel.distinct("city");
    res.json(cities.sort());
  }),
);

catalogueRouter.get(
  "/movies",
  asyncHandler(async (_req, res) => {
    const movies = await MovieModel.find().sort({ title: 1 });
    res.json(movies.map(toMovieView));
  }),
);

catalogueRouter.get(
  "/movies/:id",
  asyncHandler(async (req, res) => {
    const movie = await MovieModel.findById(toObjectId(req.params.id, "movie id"));
    if (!movie) {
      throw ApiError.notFound("Movie not found.");
    }
    res.json(toMovieView(movie));
  }),
);

catalogueRouter.get(
  "/shows",
  validate(showFiltersSchema, "query"),
  asyncHandler(async (req, res) => {
    const shows = await listShows(req.query);
    res.json(shows);
  }),
);

catalogueRouter.get(
  "/shows/:id",
  asyncHandler(async (req, res) => {
    res.json(await getShow(req.params.id));
  }),
);

catalogueRouter.get(
  "/shows/:id/seats",
  asyncHandler(async (req, res) => {
    res.json(await getSeats(req.params.id));
  }),
);
