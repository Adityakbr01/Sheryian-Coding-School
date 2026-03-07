import { Router } from "express";
import * as movieController from "@/controllers/movie/movie.controller";
import {
  authMiddleware,
  adminMiddleware,
} from "@/middlewares/system/authMiddleware";

const router = Router();

// TMDB public endpoints
router.get("/trending/:mediaType/:timeWindow", movieController.getTrending);
router.get("/popular/:mediaType", movieController.getPopular);
router.get("/top-rated/:mediaType", movieController.getTopRated);
router.get("/details/movie/:id", movieController.getMovieDetails);
router.get("/details/tv/:id", movieController.getTvDetails);
router.get("/search/multi", movieController.searchMulti);
router.get("/search/movie", movieController.searchMovies);
router.get("/search/tv", movieController.searchTv);
router.get("/search/person", movieController.searchPeople);
router.get("/person/:id", movieController.getPersonDetails);
router.get("/videos/movie/:id", movieController.getMovieVideos);
router.get("/videos/tv/:id", movieController.getTvVideos);
router.get("/genres/:mediaType", movieController.getGenres);
router.get("/discover/movie", movieController.discoverMovies);
router.get("/discover/tv", movieController.discoverTv);

// Custom movies CRUD (admin)
router.get("/custom", movieController.getCustomMovies);
router.get("/custom/:id", movieController.getCustomMovieById);
router.post(
  "/custom",
  authMiddleware,
  adminMiddleware,
  movieController.createMovie
);
router.put(
  "/custom/:id",
  authMiddleware,
  adminMiddleware,
  movieController.updateCustomMovie
);
router.delete(
  "/custom/:id",
  authMiddleware,
  adminMiddleware,
  movieController.deleteCustomMovie
);

export default router;
