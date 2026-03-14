import winston from 'winston';
import env from 'configs/ENV';

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    env.NODE_ENV === 'development' ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

const transports = [
    new winston.transports.Console(),
];

const logger = winston.createLogger({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    format,
    transports,
});

export default logger;
