import express, { Express } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';

export const configureParsers = (app: Express) => {
    // 1. Body Parsing
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // 2. Cookie Parsing
    app.use(cookieParser());

    // 3. Compression (Gzip)
    app.use(compression());
};
