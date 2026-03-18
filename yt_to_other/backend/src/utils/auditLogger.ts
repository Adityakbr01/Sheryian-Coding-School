import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDir = 'logs';

// Separate logger for audit trails (business events)
// E.g., User initiated download, User payment, Serious system state changes
const auditLoggerInstance = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json() // Structured JSON format for easier parsing later
    ),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(logDir, 'audit-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '90d', // Keep audits longer
            level: 'info'
        })
    ]
});

export const auditLog = (action: string, details: object, status: 'SUCCESS' | 'FAILURE' = 'SUCCESS') => {
    auditLoggerInstance.info({
        action,
        status,
        ...details,
        timestamp: new Date().toISOString()
    });
};
