import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { env } from '../config/env'

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf((info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
)

const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'HH:mm:ss:ms' }),
    winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
)

const transports = [
    // Console output for development and fast insights
    new winston.transports.Console({
        format: consoleFormat,
    }),

    // Rotating files for error and combined logs for production audits
    new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '14d',
        format,
    }),
    new DailyRotateFile({
        filename: 'logs/all-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        format,
    }),
]

export const logger = winston.createLogger({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    transports,
})
