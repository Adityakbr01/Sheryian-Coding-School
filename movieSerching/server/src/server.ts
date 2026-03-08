import app from "@/app";
import { env } from "@/configs/env";
import { connectDB } from "@/db/mongo";
import logger from "@/utils/logger";
import { Server } from "http";

let server: Server;

const startServer = async () => {
  try {
    // connect database
    await connectDB();
    logger.info("✅ MongoDB connected");

    // start server
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });

  } catch (error) {
    logger.error("❌ Failed to start server", error);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  shutdown();
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  shutdown();
});

const shutdown = () => {
  logger.info("⚠️ Shutting down server...");

  if (server) {
    server.close(() => {
      logger.info("🛑 Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};