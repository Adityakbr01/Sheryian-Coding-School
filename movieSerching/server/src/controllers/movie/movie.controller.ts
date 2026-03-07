import { Request, Response, NextFunction } from "express";
import { catchAsync } from "@/utils/appError";
import { ApiResponse } from "@/utils/apiResponse";
import { TMDB_MEDIA, TIME_WINDOW, MEDIA_TYPE } from "@/constants/mediaType";
import type { TmdbMedia, TimeWindow } from "@/constants/mediaType";
import * as tmdbService from "@/services/movie/tmdb.service";
import * as movieService from "@/services/movie/movie.service";

// TMDB endpoints
export const getTrending = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { mediaType = TMDB_MEDIA.ALL, timeWindow = TIME_WINDOW.DAY } = req.params;
    const page = Number(req.query.page) || 1;
    const data = await tmdbService.getTrending(mediaType as TmdbMedia, timeWindow as TimeWindow, page);
    ApiResponse.ok(res, data);
  }
);

export const getPopular = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { mediaType = MEDIA_TYPE.MOVIE } = req.params;
    const page = Number(req.query.page) || 1;
    const data = await tmdbService.getPopular(mediaType as TmdbMedia, page);
    ApiResponse.ok(res, data);
  }
);

export const getTopRated = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { mediaType = MEDIA_TYPE.MOVIE } = req.params;
    const page = Number(req.query.page) || 1;
    const data = await tmdbService.getTopRated(mediaType as TmdbMedia, page);
    ApiResponse.ok(res, data);
  }
);

export const getMovieDetails = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const id = Number(req.params.id);
    const data = await tmdbService.getMovieDetails(id);
    ApiResponse.ok(res, data);
  }
);

export const getTvDetails = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const id = Number(req.params.id);
    const data = await tmdbService.getTvDetails(id);
    ApiResponse.ok(res, data);
  }
);

export const searchMulti = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = req.query.query as string;
    const page = Number(req.query.page) || 1;
    const data = await tmdbService.searchMulti(query, page);
    ApiResponse.ok(res, data);
  }
);

export const searchMovies = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = req.query.query as string;
    const page = Number(req.query.page) || 1;
    const data = await tmdbService.searchMovies(query, page);
    ApiResponse.ok(res, data);
  }
);

export const searchTv = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = req.query.query as string;
    const page = Number(req.query.page) || 1;
    const data = await tmdbService.searchTv(query, page);
    ApiResponse.ok(res, data);
  }
);

export const searchPeople = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = req.query.query as string;
    const page = Number(req.query.page) || 1;
    const data = await tmdbService.searchPeople(query, page);
    ApiResponse.ok(res, data);
  }
);

export const getPersonDetails = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const id = Number(req.params.id);
    const data = await tmdbService.getPersonDetails(id);
    ApiResponse.ok(res, data);
  }
);

export const getMovieVideos = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const id = Number(req.params.id);
    const data = await tmdbService.getMovieVideos(id);
    ApiResponse.ok(res, data);
  }
);

export const getTvVideos = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const id = Number(req.params.id);
    const data = await tmdbService.getTvVideos(id);
    ApiResponse.ok(res, data);
  }
);

export const getGenres = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { mediaType = MEDIA_TYPE.MOVIE } = req.params;
    const data = await tmdbService.getGenres(mediaType as TmdbMedia);
    ApiResponse.ok(res, data);
  }
);

export const discoverMovies = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await tmdbService.discoverMovies(req.query);
    ApiResponse.ok(res, data);
  }
);

export const discoverTv = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await tmdbService.discoverTv(req.query);
    ApiResponse.ok(res, data);
  }
);

// Custom movie CRUD (admin)
export const createMovie = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const movie = await movieService.createMovie(req.body);
    ApiResponse.created(res, movie, "Movie created successfully");
  }
);

export const getCustomMovies = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const category = req.query.category as string;
    const genre = req.query.genre as string;
    const data = await movieService.getAllMovies(page, limit, category, genre);
    ApiResponse.paginated(res, data.movies, { page, limit, total: data.total, totalPages: data.totalPages });
  }
);

export const getCustomMovieById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const movie = await movieService.getMovieById(req.params.id as string);
    ApiResponse.ok(res, movie);
  }
);

export const updateCustomMovie = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const movie = await movieService.updateMovie(req.params.id as string, req.body);
    ApiResponse.ok(res, movie, "Movie updated successfully");
  }
);

export const deleteCustomMovie = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await movieService.deleteMovie(req.params.id as string);
    ApiResponse.ok(res, undefined, "Movie deleted successfully");
  }
);
