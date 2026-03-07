import { Response, NextFunction } from "express";
import { catchAsync } from "@/utils/appError";
import { ApiResponse } from "@/utils/apiResponse";
import { AuthRequest } from "@/middlewares/system/authMiddleware";
import * as favoriteService from "@/services/favorite/favorite.service";

export const addFavorite = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const favorite = await favoriteService.addFavorite(
      req.user!._id.toString(),
      req.body
    );
    ApiResponse.created(res, favorite, "Added to favorites");
  }
);

export const removeFavorite = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    await favoriteService.removeFavorite(
      req.user!._id.toString(),
      req.params.id as string
    );
    ApiResponse.ok(res, undefined, "Removed from favorites");
  }
);

export const removeFavoriteByTmdbId = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    await favoriteService.removeFavoriteByTmdbId(
      req.user!._id.toString(),
      Number(req.params.tmdbId)
    );
    ApiResponse.ok(res, undefined, "Removed from favorites");
  }
);

export const getUserFavorites = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await favoriteService.getUserFavorites(
      req.user!._id.toString(),
      page,
      limit
    );
    ApiResponse.paginated(res, data.favorites, { page, limit, total: data.total, totalPages: data.totalPages });
  }
);

export const checkIsFavorite = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const isFavorite = await favoriteService.checkIsFavorite(
      req.user!._id.toString(),
      Number(req.params.tmdbId)
    );
    ApiResponse.ok(res, { isFavorite });
  }
);