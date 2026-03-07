import { Request, Response, NextFunction } from "express";
import { catchAsync } from "@/utils/appError";
import { ApiResponse } from "@/utils/apiResponse";
import * as userService from "@/services/user/user.service";
import { AuthRequest } from "@/middlewares/system/authMiddleware";

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await userService.getAllUsers(page, limit);
    ApiResponse.ok(res, data);
  }
);

export const getUserById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.getUserById(req.params.id as string);
    ApiResponse.ok(res, user);
  }
);

export const banUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.banUser(req.params.id as string);
    ApiResponse.ok(res, user, "User banned");
  }
);

export const unbanUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.unbanUser(req.params.id as string);
    ApiResponse.ok(res, user, "User unbanned");
  }
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await userService.deleteUser(req.params.id as string);
    ApiResponse.ok(res, undefined, "User deleted");
  }
);

export const updateProfile = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await userService.updateUserProfile(
      req.user!._id.toString(),
      req.body
    );
    ApiResponse.ok(res, user, "Profile updated");
  }
);
