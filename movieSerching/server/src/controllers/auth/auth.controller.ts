import { Request, Response, NextFunction } from "express";
import { catchAsync } from "@/utils/appError";
import { ApiResponse } from "@/utils/apiResponse";
import { AuthRequest } from "@/middlewares/system/authMiddleware";
import * as authService from "@/services/auth/auth.service";
import { env } from "@/configs/env";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const sanitizeUser = (user: any) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

export const register = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { user, token } = await authService.registerUser(req.body);
    res.cookie("token", token, cookieOptions);
    ApiResponse.created(res, { user: sanitizeUser(user), token }, "Registration successful");
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { user, token } = await authService.loginUser(req.body);
    res.cookie("token", token, cookieOptions);
    ApiResponse.ok(res, { user: sanitizeUser(user), token }, "Login successful");
  }
);

export const logout = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.clearCookie("token");
    ApiResponse.ok(res, undefined, "Logged out successfully");
  }
);

export const getMe = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await authService.getCurrentUser(req.user!._id.toString());
    ApiResponse.ok(res, { user: sanitizeUser(user) });
  }
);
