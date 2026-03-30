import zod from 'zod';

const envSchema = zod.object({
    NODE_ENV: zod.enum(['development', 'production', 'test']).default('development'),
    PORT: zod.string().default('3001'),
    MONGO_URI: zod.string().min(1),
    JWT_SECRET: zod.string().min(10),
    JWT_EXPIRES_IN: zod.string().default('7d'),

    // LLM Configuration
    LLM_PROVIDER: zod.literal('gemini').default('gemini'),
    LLM_CLASSIFY_TEMP: zod.string().default('0.1'),
    LLM_GENERATE_TEMP: zod.string().default('0.75'),

    // Gemini Configuration
    GEMINI_API_KEY: zod.string().default(''),
    GEMINI_MODEL: zod.string().default('models/gemini-2.5-flash-lite'),

    // Game Configuration
    DEFAULT_BASE_PRICE: zod.string().default('1000'),
    DEFAULT_MIN_PRICE: zod.string().default('700'),
    MAX_ROUNDS: zod.string().default('10'),
    LEADERBOARD_RESET_DAYS: zod.string().default('7'),

    // Redis
    REDIS_URL: zod.string().default('redis://localhost:6379'),

    // Analytics
    ANALYTICS_JOB_INTERVAL_SESSIONS: zod.string().default('100'),

    //credential for user
    adminEmail: zod.string().default('admin@gmail.com'),
    adminPassword: zod.string().default('admin123'),
    adminName: zod.string().default('Admin'),

    CLIENT_URL: zod.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.issues, null, 2));
    process.exit(1);
}

export const env = parsed.data;