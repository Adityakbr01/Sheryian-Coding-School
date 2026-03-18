import { z } from 'zod';
import { DownloadFormat, DownloadServer } from './downloader.types';

export const downloadRequestSchema = z.object({
    url: z.string().url({ message: "Invalid YouTube URL provided" }).regex(/youtube\.com|youtu\.be/, { message: "Must be a valid YouTube link" }),
    format: z.nativeEnum(DownloadFormat).default(DownloadFormat.MP4),
    server: z.nativeEnum(DownloadServer).default(DownloadServer.SECURE),
});

export type DownloadRequestInput = z.infer<typeof downloadRequestSchema>;
