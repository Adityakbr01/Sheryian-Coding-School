export type DownloadFormat = 'mp4' | 'mp3';
export const DownloadFormat = {
    MP4: 'mp4' as const,
    MP3: 'mp3' as const
};

export type DownloadServer = 'SECURE' | 'FASTER';
export const DownloadServer = {
    SECURE: 'SECURE' as const,
    FASTER: 'FASTER' as const
};

export type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'prioritized';
export const JobState = {
    WAITING: 'waiting' as const,
    ACTIVE: 'active' as const,
    COMPLETED: 'completed' as const,
    FAILED: 'failed' as const,
    DELAYED: 'delayed' as const,
    PRIORITIZED: 'prioritized' as const
};

export interface IJobResult {
    downloadUrl: string;
    title?: string;
    thumbnail?: string;
}

export interface IJobStatus {
    jobId: string;
    state: JobState;
    progress: number;
    result?: IJobResult;
    error?: string;
}

export interface IDownloadPayload {
    url: string;
    format: DownloadFormat;
    server: DownloadServer;
}
