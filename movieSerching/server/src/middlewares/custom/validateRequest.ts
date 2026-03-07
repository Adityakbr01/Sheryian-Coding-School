import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.errors
        .map((e) => e.message)
        .join(", ");
      return next(new AppError(errorMessages, 400));
    }
    req.body = result.data;
    next();
  };
};
