import React from 'react';
import { JobState } from '../types';
import type { IJobStatus } from '../types';
import { CheckCircle, XCircle, Clock, Loader2, Download } from 'lucide-react';

interface Props {
    status: IJobStatus;
}

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const StatusCard: React.FC<Props> = ({ status }) => {
    const { state, progress, result, error } = status;

    const getDownloadLink = () => {
        if (!result?.downloadUrl) return '#';
        if (result.downloadUrl.startsWith('http')) return result.downloadUrl;

        let base = BASE_API_URL;
        if (base.endsWith('/')) base = base.slice(0, -1);

        // If base ends with /api and path starts with /api (as is common), strip one /api from base
        if (base.endsWith('/api') && result.downloadUrl.startsWith('/api')) {
            base = base.slice(0, -4);
        }

        const path = result.downloadUrl.startsWith('/') ? result.downloadUrl : `/${result.downloadUrl}`;
        return `${base}${path}`;
    };

    const getIcon = () => {
        switch (state) {
            case JobState.COMPLETED: return <CheckCircle className="text-green-500 w-8 h-8" />;
            case JobState.FAILED: return <XCircle className="text-red-500 w-8 h-8" />;
            case JobState.ACTIVE: return <Loader2 className="text-blue-500 w-8 h-8 animate-spin" />;
            default: return <Clock className="text-yellow-500 w-8 h-8" />;
        }
    };

    const getStatusText = () => {
        switch (state) {
            case JobState.COMPLETED: return 'Ready to Download';
            case JobState.FAILED: return 'Download Failed';
            case JobState.ACTIVE: return 'Processing...';
            case JobState.WAITING: return 'In Queue...';
            default: return 'Pending...';
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-6 p-6 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-4">
                {getIcon()}
                <div>
                    <h3 className="text-lg font-semibold text-white">{getStatusText()}</h3>
                    {state === JobState.ACTIVE && (
                        <p className="text-sm text-zinc-400">Please wait while we process your video.</p>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {(state === JobState.ACTIVE || state === JobState.WAITING) && (
                <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            {/* Result */}
            {state === JobState.COMPLETED && result && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    {result.title && <p className="text-sm text-zinc-300 mb-3 truncate">{result.title}</p>}

                    <a
                        href={getDownloadLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-center font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        download // Hint to browser to download
                    >
                        <Download className="w-4 h-4" />
                        Download Now
                    </a>
                </div>
            )}

            {/* Error */}
            {state === JobState.FAILED && (
                <div className="mt-2 text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/50">
                    {error || 'An unexpected error occurred.'}
                </div>
            )}
        </div>
    );
};
