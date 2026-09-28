import { Router } from "express";
import { ApiError } from "../../lib/api-error";
import { asyncHandler } from "../../lib/async-handler";
import { toObjectId } from "../../lib/ids";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { CinemaModel, toCinemaView } from "../cinemas/cinema.model";
import { ScreenModel, toScreenView } from "../cinemas/screen.model";
import { MovieModel, toMovieView } from "../movies/movie.model";
import { createShow } from "../shows/show.service";
import { cinemaSchema, movieSchema, screenFiltersSchema, screenSchema, showSchema } from "./admin.schemas";
import { getStats } from "./admin.service";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/cinemas",
  asyncHandler(async (_req, res) => {
    const cinemas = await CinemaModel.find().sort({ city: 1, name: 1 });
    res.json(cinemas.map(toCinemaView));
  }),
);

adminRouter.post(
  "/cinemas",
  validate(cinemaSchema),
  asyncHandler(async (req, res) => {
    const cinema = await CinemaModel.create(req.body);
    res.status(201).json(toCinemaView(cinema));
  }),
);

adminRouter.get(
  "/screens",
  validate(screenFiltersSchema, "query"),
  asyncHandler(async (req, res) => {
    const filter = req.query.cinemaId ? { cinemaId: toObjectId(String(req.query.cinemaId), "cinema id") } : {};
    const screens = await ScreenModel.find(filter).sort({ name: 1 });
    res.json(screens.map(toScreenView));
  }),
);

adminRouter.post(
  "/screens",
  validate(screenSchema),
  asyncHandler(async (req, res) => {
    const cinemaId = toObjectId(req.body.cinemaId, "cinema id");
    const cinema = await CinemaModel.exists({ _id: cinemaId });
    if (!cinema) {
      throw ApiError.notFound("Cinema not found.");
    }
    const screen = await ScreenModel.create({ ...req.body, cinemaId });
    res.status(201).json(toScreenView(screen));
  }),
);

adminRouter.post(
  "/movies",
  validate(movieSchema),
  asyncHandler(async (req, res) => {
    const movie = await MovieModel.create(req.body);
    res.status(201).json(toMovieView(movie));
  }),
);

adminRouter.post(
  "/shows",
  validate(showSchema),
  asyncHandler(async (req, res) => {
    const show = await createShow(req.body);
    res.status(201).json(show);
  }),
);

adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    res.json(await getStats());
  }),
);
