import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { AppError } from "@/utils/appError";
import { ApiResponse } from "@/utils/apiResponse";
import logger from "@/utils/logger";

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const upstream = err.response?.data;
    logger.error(`Upstream API error`, { method: req.method, url: req.originalUrl, upstreamStatus: status, upstream });
    statusCode = status === 401 || status === 403 ? 502 : status || 502;
    message =
      upstream?.status_message ||
      `Upstream API error (${status || "no response"})`;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if ((err as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate entry. This resource already exists.";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Log with full context
  logger.error(`${req.method} ${req.originalUrl} → ${statusCode} ${message}`, {
    errorName: err.name,
    statusCode,
    ...(statusCode === 500 && { stack: err.stack }),
  });

  ApiResponse.error(res, { statusCode, message, stack: err.stack });
};

