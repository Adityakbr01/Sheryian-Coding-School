import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    //AI Keys
    GEMINI_API_KEY: z.string().min(1).optional(),
    GEMINI_MODEL: z.string().default('models/gemini-3-flash-preview'),
    HUGGINGFACE_API_KEY: z.string().min(1).optional(), //for nomic-embed-text-v1.5
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type EnvConfig = z.infer<typeof envSchema>

// Parse process.env and throw an error right away if anything is missing / invalid
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format())
    process.exit(1)
}

export const env = parsedEnv.data
