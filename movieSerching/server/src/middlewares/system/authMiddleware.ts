import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/configs/env";
import { User, IUser } from "@/models/user/user.model";
import { AppError } from "@/utils/appError";

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check cookie first, then Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized. Please log in.", 401));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User not found.", 401));
    }

    if (user.isBanned) {
      return next(
        new AppError("Your account has been banned. Contact support.", 403)
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token.", 401));
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "admin") {
    return next(new AppError("Admin access required.", 403));
  }
  next();
};
