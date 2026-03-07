import { Response, NextFunction } from "express";
import { catchAsync } from "@/utils/appError";
import { ApiResponse } from "@/utils/apiResponse";
import { AuthRequest } from "@/middlewares/system/authMiddleware";
import * as watchHistoryService from "@/services/watchHistory/watchHistory.service";

export const addToWatchHistory = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const entry = await watchHistoryService.addToWatchHistory(
      req.user!._id.toString(),
      req.body
    );
    ApiResponse.created(res, entry, "Added to watch history");
  }
);

export const getUserWatchHistory = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await watchHistoryService.getUserWatchHistory(
      req.user!._id.toString(),
      page,
      limit
    );
    ApiResponse.paginated(res, data.history, { page, limit, total: data.total, totalPages: data.totalPages });
  }
);

export const clearWatchHistory = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    await watchHistoryService.clearWatchHistory(req.user!._id.toString());
    ApiResponse.ok(res, undefined, "Watch history cleared");
  }
);
