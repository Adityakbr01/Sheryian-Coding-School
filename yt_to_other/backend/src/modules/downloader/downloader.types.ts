export enum DownloadServer {
    SECURE = 'SECURE', // Local processing
    FASTER = 'FASTER'  // 3rd party API
}

export enum DownloadFormat {
    MP4 = 'mp4',
    MP3 = 'mp3'
}

export enum JobState {
    WAITING = 'waiting',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    FAILED = 'failed',
    DELAYED = 'delayed'
}

export interface IDownloadRequest {
    url: string;
    format: DownloadFormat;
    server: DownloadServer;
}

export interface IJobData extends IDownloadRequest {
    jobId: string;
    timestamp: number;
}

export interface IJobResult {
    downloadUrl: string;
    title?: string;
    thumbnail?: string;
    duration?: string;
    filename?: string;
    isDirectUrl?: boolean;
}

export interface IJobStatusResponse {
    jobId: string;
    state: JobState;
    progress: number;
    result?: IJobResult | null;
    error?: string;
}
