import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().default(3001),
    RAPID_API_KEY: z.string().optional(),
    RAPID_HOST: z.string().optional(),
    RAPIDAPI_HOST: z.string().optional(),
    UPSTASH_REDIS_URL: z.string().url("Invalid Redis URL"),
    CORS_ORIGIN: z.string().default("*"),
    YTDLP_COOKIES_FILE: z.string().optional(),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    throw new Error("Invalid environment variables");
}

export const ENV = parsedEnv.data;
