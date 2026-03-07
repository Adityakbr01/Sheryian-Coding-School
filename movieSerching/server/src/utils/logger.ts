import winston from "winston";
import { env } from "@/configs/env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ── Pretty dev format ────────────────────────────────
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const ts = (timestamp as string).replace("T", " ").replace("Z", "");
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta)}` : "";
    return `${ts} ${level}: ${stack || message}${metaStr}`;
});

// ── Create logger ────────────────────────────────────
const logger = winston.createLogger({
    level: env.NODE_ENV === "production" ? "warn" : "debug",
    defaultMeta: { service: "movie-platform" },
    format: combine(errors({ stack: true }), timestamp()),
    transports: [],
});

if (env.NODE_ENV === "production") {
    // Production: structured JSON logs
    logger.add(
        new winston.transports.Console({
            format: combine(json()),
        })
    );
} else {
    // Development: colorized, human-readable
    logger.add(
        new winston.transports.Console({
            format: combine(colorize({ all: true }), devFormat),
        })
    );
}

export default logger;
