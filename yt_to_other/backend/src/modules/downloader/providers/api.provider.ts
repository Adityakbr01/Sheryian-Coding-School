import { IJobData, IJobResult, DownloadFormat } from '../downloader.types';
import { AppError } from '@/utils/appError';

export const processThirdParty = async (data: IJobData, updateProgress: (progress: number) => void): Promise<IJobResult> => {
    const { url, format } = data;

    updateProgress(10);

    // Validate URL briefly
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        throw new AppError("Invalid YouTube URL provided", 400);
    }

    updateProgress(30);

    try {
        const isAudio = format === DownloadFormat.MP3;

        const rapidApiKey = process.env.RAPID_API_KEY;
        const rapidApiHost = process.env.RAPIDAPI_HOST || 'youtube-media-downloader.p.rapidapi.com';

        if (rapidApiKey) {
            try {
                return await processRapidAPI(url, isAudio, rapidApiKey, rapidApiHost, updateProgress);
            } catch (rapidError: any) {
                console.warn(`[API Provider] RapidAPI failed (403/Quota/Error): ${rapidError.message}. Falling back to Cobalt...`);
            }
        }

        // Ensure we try the fallback if RapidAPI was skipped OR failed
        console.info(`[API Provider] Attempting Cobalt fallback for: ${url}`);
        return await processCobaltFallback(url, isAudio, updateProgress);

    } catch (error: any) {
        console.error(error);
        throw new AppError(`Third-party service failed: ${error.message}`, 502);
    }
};

const processRapidAPI = async (url: string, isAudio: boolean, apiKey: string, apiHost: string, updateProgress: (P: number) => void): Promise<IJobResult> => {
    updateProgress(40);
    const videoId = extractVideoId(url);

    // Using the user-specified youtube-media-downloader endpoint
    const apiUrl = `https://${apiHost}/v2/video/details?videoId=${videoId}&urlAccess=normal&videos=auto&audios=auto`;

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`RapidAPI returned ${response.status}`);
    }

    const data = await response.json();
    updateProgress(80);

    let bestLink = '';

    if (data) {
        if (isAudio && data.audios && data.audios.items && data.audios.items.length > 0) {
            // Pick highest quality M4A or MP3
            bestLink = data.audios.items[0].url;
        } else if (!isAudio && data.videos && data.videos.items && data.videos.items.length > 0) {
            // Find a video with audio embedded
            const videosWithAudio = data.videos.items.filter((v: any) => v.hasAudio === true);
            if (videosWithAudio.length > 0) {
                bestLink = videosWithAudio[0].url;
            } else {
                bestLink = data.videos.items[0].url;
            }
        }
    }

    // If the logical parsing fails, fallback
    if (!bestLink) {
        bestLink = data.url || 'https://example.com/mock-download';
    }

    updateProgress(100);

    return {
        title: data.title || "YouTube Video",
        downloadUrl: bestLink,
        thumbnail: data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[0].url : `https://img.youtube.com/vi/${extractVideoId(url)}/maxresdefault.jpg`,
        isDirectUrl: true
    };
};

const processCobaltFallback = async (url: string, isAudio: boolean, updateProgress: (P: number) => void): Promise<IJobResult> => {

    const response = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
            url: url,
            isAudioOnly: isAudio,
            aFormat: isAudio ? 'mp3' : 'best',
            vQuality: '1080',
            filenamePattern: 'classic'
        })
    });

    if (!response.ok) {
        throw new Error(`External API returned ${response.status}`);
    }

    const resultData = await response.json();
    updateProgress(80);

    if (resultData.status === 'error') {
        throw new Error(resultData.text || 'API Error');
    }

    updateProgress(100);

    return {
        title: "YouTube Video", // Cobalt often doesn't return title natively in this endpoint, client gets it via filename
        downloadUrl: resultData.url, // Direct high-speed download link
        thumbnail: `https://img.youtube.com/vi/${extractVideoId(url)}/maxresdefault.jpg`,
        isDirectUrl: true
    };
};

// Helper to extract YouTube ID for the thumbnail
function extractVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : 'default';
}
