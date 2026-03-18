import ytDlp, { exec as ytDlpExec } from 'yt-dlp-exec';
import fs from 'fs';
import path from 'path';
import { IJobData, IJobResult, DownloadFormat } from '../downloader.types';
import { AppError } from '@/utils/appError';
import { logger } from '@/utils/logger';

// Lazy-load ffmpeg/ffprobe paths
const ffmpegPath = require('ffmpeg-static') as string;
const ffprobePath = require('ffprobe-static').path as string;

// Setup a local bin directory for yt-dlp to find both binaries
const BIN_DIR = path.join(process.cwd(), 'bin');
if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });

const ffmpegDest = path.join(BIN_DIR, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const ffprobeDest = path.join(BIN_DIR, process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');

// Copy binaries if they don't exist in our bin folder
try {
    if (!fs.existsSync(ffmpegDest)) {
        fs.copyFileSync(ffmpegPath, ffmpegDest);
        logger.info(`[Setup] Copied ffmpeg to ${ffmpegDest}`);
    }
    if (!fs.existsSync(ffprobeDest)) {
        fs.copyFileSync(ffprobePath, ffprobeDest);
        logger.info(`[Setup] Copied ffprobe to ${ffprobeDest}`);
    }
} catch (err: any) {
    logger.error(`[Setup] Failed to setup ffmpeg/ffprobe binaries: ${err.message}`);
}

export const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');
const FILE_TTL_MS = 60 * 60 * 1000;

fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

// ── Base flags shared by every yt-dlp call ───────────────────────────────────
const BASE_FLAGS: Record<string, any> = {
    noCheckCertificates: true,
    noWarnings: true,
    ffmpegLocation: BIN_DIR,
    extractorArgs: 'youtube:player_client=web,mweb,android',
    addHeader: [
        'referer:https://www.youtube.com/',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ],
};

const COOKIES_FILE = process.env.YTDLP_COOKIES_FILE;
if (COOKIES_FILE && fs.existsSync(COOKIES_FILE)) {
    BASE_FLAGS.cookies = COOKIES_FILE;
    logger.info('[YtDlpProvider] Using cookies file for authentication');
}

export const processYtDlp = async (
    data: IJobData,
    updateProgress: (progress: number) => void,
): Promise<IJobResult> => {
    const { format, jobId } = data;

    // Strip playlist params so yt-dlp downloads only the single video
    const cleanUrl = stripPlaylistParams(data.url);
    const url = cleanUrl;

    // ── Startup diagnostics ────────────────────────────────────────────────
    logger.info(`[YtDlpProvider] ━━━ Job START ━━━ id=${jobId} format=${format}`);
    logger.info(`[YtDlpProvider] URL: ${url}`);
    logger.info(`[YtDlpProvider] DOWNLOAD_DIR: ${DOWNLOAD_DIR}`);
    logger.info(`[YtDlpProvider] Cookies file: ${COOKIES_FILE ?? 'NOT SET'}`);
    logger.info(`[YtDlpProvider] BASE_FLAGS: ${JSON.stringify(BASE_FLAGS)}`);

    updateProgress(5);

    // ── 1. Metadata with hard 20s timeout ─────────────────────────────────
    let title = 'YouTube Video';
    let thumbnail = '';

    logger.info(`[YtDlpProvider] [1/4] Fetching metadata…`);
    const metaStart = Date.now();

    try {
        const meta: any = await Promise.race([
            ytDlp(url, { ...BASE_FLAGS, dumpJson: true, skipDownload: true }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Metadata timeout after 20s')), 20_000),
            ),
        ]);
        title = meta?.title ?? title;
        thumbnail = meta?.thumbnail ?? '';
        logger.info(`[YtDlpProvider] ✔ Metadata OK in ${Date.now() - metaStart}ms — "${title}"`);
        logger.info(`[YtDlpProvider]   Duration: ${meta?.duration}s  Uploader: ${meta?.uploader}`);
        logger.info(`[YtDlpProvider]   Thumbnail: ${thumbnail || 'none'}`);
    } catch (err: any) {
        logger.error(`[YtDlpProvider] ✖ Metadata FAILED after ${Date.now() - metaStart}ms`);
        logger.error(`[YtDlpProvider]   Error: ${err.message}`);
        logger.warn(`[YtDlpProvider]   Continuing without metadata — download will still be attempted`);
    }

    updateProgress(10);

    // ── 2. Build download flags ────────────────────────────────────────────
    const outputTemplate = path.join(DOWNLOAD_DIR, `${jobId}.%(ext)s`);

    const flags: Record<string, any> = {
        ...BASE_FLAGS,
        output: outputTemplate,
        retries: 5,
        noPlaylist: true,   // only download the single video, ignore &list= param
        fragmentRetries: 5,
    };

    if (format === DownloadFormat.MP3) {
        flags.extractAudio = true;
        flags.audioFormat = 'mp3';
        flags.audioQuality = '0';
    } else {
        flags.format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        flags.mergeOutputFormat = 'mp4';
    }

    logger.info(`[YtDlpProvider] [2/4] Download flags resolved:`);
    logger.info(`[YtDlpProvider]   ${JSON.stringify(flags)}`);
    logger.info(`[YtDlpProvider]   Output template: ${outputTemplate}`);

    // ── 3. Execute download ────────────────────────────────────────────────
    logger.info(`[YtDlpProvider] [3/4] Spawning yt-dlp process…`);
    const dlStart = Date.now();

    const proc = ytDlpExec(url, flags);
    let lastProgress = 10;
    let stderrBuffer = '';
    let stdoutLineCount = 0;

    proc.stdout?.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        stdoutLineCount++;
        // Log every stdout line — this is where yt-dlp reports format selection,
        // destination path, merge steps, and download progress
        logger.info(`[YtDlpProvider][stdout] ${text.trim()}`);

        const match = text.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
        if (match?.[1]) {
            const raw = parseFloat(match[1]);
            const mapped = Math.floor(10 + raw * 0.85);
            if (mapped > lastProgress) {
                lastProgress = mapped;
                logger.info(`[YtDlpProvider] Progress: ${raw.toFixed(1)}% raw → ${mapped}% mapped`);
                updateProgress(mapped);
            }
        }
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
        const text = chunk.toString().trim();
        if (!text) return;
        stderrBuffer += text + '\n';
        // stderr at warn so it's always visible regardless of log level
        logger.warn(`[YtDlpProvider][stderr] ${text}`);
    });

    proc.on?.('error', (err: Error) => {
        logger.error(`[YtDlpProvider] Process spawn error: ${err.message}`);
    });

    try {
        await proc;
        logger.info(`[YtDlpProvider] ✔ yt-dlp exited cleanly in ${Date.now() - dlStart}ms`);
        logger.info(`[YtDlpProvider]   stdout lines received: ${stdoutLineCount}`);
    } catch (err: any) {
        const elapsed = Date.now() - dlStart;
        const detail = stderrBuffer.slice(-1000).trim();
        logger.error(`[YtDlpProvider] ✖ yt-dlp FAILED after ${elapsed}ms`);
        logger.error(`[YtDlpProvider]   Exit code: ${err.exitCode ?? 'n/a'}  Signal: ${err.signal ?? 'n/a'}`);
        logger.error(`[YtDlpProvider]   Last stderr output:\n${detail || '(empty)'}`);
        throw new AppError(buildUserFriendlyError(detail, err.message), 500);
    }

    updateProgress(97);

    // ── 4. Locate output file ──────────────────────────────────────────────
    logger.info(`[YtDlpProvider] [4/4] Scanning downloads dir for output file…`);
    const files = fs.readdirSync(DOWNLOAD_DIR);
    logger.info(`[YtDlpProvider]   Files in ${DOWNLOAD_DIR}: [${files.join(', ') || 'EMPTY'}]`);

    const actualFile = files.find((name) => name.startsWith(jobId));

    if (!actualFile) {
        logger.error(`[YtDlpProvider] ✖ No file starting with jobId "${jobId}" found!`);
        throw new AppError('Output file missing after yt-dlp completed', 500);
    }

    const filePath = path.join(DOWNLOAD_DIR, actualFile);
    const fileSize = fs.statSync(filePath).size;
    logger.info(`[YtDlpProvider] ✔ Found: ${actualFile} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    scheduleFileDeletion(filePath, FILE_TTL_MS);
    updateProgress(100);
    logger.info(`[YtDlpProvider] ━━━ Job DONE ━━━ id=${jobId} file=${actualFile}`);

    return {
        title,
        filename: actualFile,
        downloadUrl: `/api/files/${actualFile}`,
        thumbnail,
        isDirectUrl: false,
    };
};

function buildUserFriendlyError(stderr: string, fallback: string): string {
    if (stderr.includes('Sign in to confirm') || stderr.includes('bot')) {
        return 'YouTube bot-detection triggered. Set YTDLP_COOKIES_FILE in your .env to fix this.';
    }
    if (stderr.includes('Video unavailable') || stderr.includes('Private video')) {
        return 'This video is unavailable or private.';
    }
    if (stderr.includes('429') || stderr.includes('Too Many Requests')) {
        return 'YouTube is rate-limiting this server. Try again in a few minutes.';
    }
    if (stderr.includes('Postprocessing') || stderr.includes('ffmpeg')) {
        return 'ffmpeg post-processing failed. Ensure ffmpeg is installed on the server.';
    }
    return `Download failed: ${fallback}`;
}

function scheduleFileDeletion(filePath: string, ttlMs: number): void {
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                logger.warn(`[YtDlpProvider] Could not delete ${filePath}: ${err.message}`);
            } else {
                logger.debug(`[YtDlpProvider] Deleted expired file ${filePath}`);
            }
        });
    }, ttlMs).unref();
}

/**
 * Remove &list=, &start_radio=, &index= etc. from YouTube URLs so yt-dlp
 * never interprets the URL as a playlist. We keep only the video ID param.
 */
function stripPlaylistParams(raw: string): string {
    try {
        const u = new URL(raw);
        // Keep only `v` for watch URLs, everything else is playlist noise
        if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
            const v = u.searchParams.get('v');
            if (v) return `https://www.youtube.com/watch?v=${v}`;
        }
        // youtu.be/<id> — already clean
        return raw;
    } catch {
        return raw; // not a valid URL, pass through and let yt-dlp error
    }
}