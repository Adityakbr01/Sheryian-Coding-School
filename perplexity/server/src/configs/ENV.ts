import { z } from "zod";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";


const currentFile = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFile)
const rootEnvPath = resolve(currentDir, '../../.env')

// Central Prisma config in src/config; always load server/.env.
dotenv.config({ path: rootEnvPath, override: true })


const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  MISTRALAI_API_KEY: z.string().min(1, "MISTRALAI_API_KEY is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export default env;
