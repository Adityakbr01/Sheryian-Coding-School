import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env } from "@/configs/env";
import routes from "@/routes/index";
import { ApiResponse } from "@/utils/apiResponse";
import { requestLogger } from "@/middlewares/system/requestLogger";
import { globalErrorHandler } from "@/middlewares/system/globalErrorHandler";

const app = express();

// Security headers — disable crossOriginResourcePolicy so CDN/image requests don't get blocked
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Allowed origins
const allowedOrigins = [
  env.CLIENT_URL_HOST,
  env.CLIENT_URL,
  env.CLIENT_URL_PROD,
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

// Rate limiter — brute force / DoS protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Body parsers — keep small (10kb) for security
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Health check — useful for Docker, load balancers, monitoring
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    environment: env.NODE_ENV,
  });
});

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use((_req, res) => {
  ApiResponse.error(res, {
    statusCode: 404,
    message: "Route not found",
  });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
