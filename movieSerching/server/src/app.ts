import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "@/configs/env";
import { globalErrorHandler } from "@/middlewares/system/globalErrorHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { requestLogger } from "@/middlewares/system/requestLogger";
import routes from "@/routes/index";

const app = express();

// Security middleware
app.use(helmet());
const allowedOrigins = [env.CLIENT_URL, env.CLIENT_URL_PROD];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use((_req, res) => {
  ApiResponse.error(res, { statusCode: 404, message: "Route not found" });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
