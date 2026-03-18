import React, { useState } from 'react';
import { DownloadFormat, DownloadServer } from '../types';
import type { IDownloadPayload } from '../types';
import { Download, Loader2 } from 'lucide-react';

interface Props {
    onSubmit: (payload: IDownloadPayload) => void;
    isLoading: boolean;
}

export const DownloadForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
    const [url, setUrl] = useState('');
    const [format, setFormat] = useState<DownloadFormat>(DownloadFormat.MP4);
    const [server, setServer] = useState<DownloadServer>(DownloadServer.SECURE);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        onSubmit({ url, format, server });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Download className="text-purple-500" />
                YT Downloader
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">YouTube URL</label>
                    <input
                        type="url"
                        placeholder="Paste link here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Format</label>
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value as DownloadFormat)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            <option value={DownloadFormat.MP4}>MP4 (Video)</option>
                            <option value={DownloadFormat.MP3}>MP3 (Audio)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Server</label>
                        <select
                            value={server}
                            onChange={(e) => setServer(e.target.value as DownloadServer)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            <option value={DownloadServer.SECURE}>Secure (Own Server)</option>
                            <option value={DownloadServer.FASTER}>Faster (3rd Party)</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !url}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            Starting...
                        </>
                    ) : (
                        'Download'
                    )}
                </button>
            </div>
        </form>
    );
};
