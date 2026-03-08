import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/movieplatform",
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-jwt-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  TMDB_API_KEY: process.env.TMDB_API_KEY || "",
  TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN || "",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  CLIENT_URL_HOST: process.env.CLIENT_URL_HOST || "http://[IP_ADDRESS]",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  CLIENT_URL_PROD: process.env.CLIENT_URL_PROD || "http://localhost:4173",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
