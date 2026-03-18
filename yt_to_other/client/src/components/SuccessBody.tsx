import type { DownloadFormat } from "@/features/downloader/types";
import {
    ArrowDownToLine, CheckCircle2
} from "lucide-react";

// ─── Dialog: SuccessBody ──────────────────────────────────────────────────────
interface SuccessBodyProps {
    result: {
        title?: string;
        thumbnail?: string;
        downloadUrl: string;
        isDirectUrl?: boolean;
    };
    format: DownloadFormat;
}

export function SuccessBody({ result, format }: SuccessBodyProps) {
    const isDirectUrl = result.isDirectUrl ?? false;

    // We try to suggest a filename, but browsers ignore this for cross-origin CORS requests usually.
    // It is still good practice to have it for same-origin or if headers allow.
    const ext = isDirectUrl
        ? ".mp4"
        : result.downloadUrl.slice(-4);

    const safeTitle = (result.title ?? "download")
        .replace(/[\\/:*?"<>|]/g, "_")
        .slice(0, 80);
    const filename = `${safeTitle}${ext}`;

    return (
        <div className="space-y-4 flex flex-col justify-content gap-6">
            {/* Video info card */}
            <div className="flex gap-3 items-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                {result.thumbnail && (
                    <div className="relative shrink-0">
                        <img
                            src={result.thumbnail}
                            alt="thumbnail"
                            className="w-20 h-[52px] object-cover rounded-lg bg-zinc-900"
                        />
                        <div className="absolute inset-0 rounded-lg bg-black/30 flex items-center justify-center">
                            <CheckCircle2 size={18} className="text-white drop-shadow" />
                        </div>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-medium text-zinc-200 truncate">
                        {result.title || "Video Download"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[0.62rem] font-semibold tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5">
                            {format.toUpperCase()}
                        </span>
                        <span className="text-[0.62rem] text-zinc-600">
                            {isDirectUrl ? "Direct stream" : "Served from server"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Direct Download Link */}
            <a
                href={result.downloadUrl}
                download={filename}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[0.88rem] font-semibold hover:opacity-90 active:scale-[0.98] transition-all no-underline"
            >
                <ArrowDownToLine size={16} />
                Download File
            </a>
        </div>
    );
}


export default SuccessBody;