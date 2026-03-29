import winston from 'winston';
import { env } from '../configs/env.ts';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

// ── Sensitive fields to scrub from logged request bodies ──────────────────────
const SENSITIVE_KEYS = new Set(['password', 'passwordHash', 'token', 'secret', 'authorization']);

export function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
        result[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v;
    }
    return result;
}

// ── Development: colorized, human-readable single-line format ─────────────────
const devFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ timestamp, level, message, service, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `  ${JSON.stringify(meta)}` : '';
        const stackStr = stack ? `\n${stack}` : '';
        return `${timestamp} [${service ?? 'app'}] ${level}: ${message}${metaStr}${stackStr}`;
    }),
);

// ── Production: structured JSON — easy to pipe into log aggregators ───────────
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json(),
);

// ── Logger instance ───────────────────────────────────────────────────────────
export const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    defaultMeta: { service: 'negotiateai' },
    format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [
        new winston.transports.Console(),
    ],
    // Don't crash the process on uncaught exceptions — log them instead
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
});

