import type { DownloadFormat } from "@/features/downloader/types";
import {
    ArrowDownToLine, CheckCircle2,
    Loader2
} from "lucide-react";
import { useState } from "react";
import { useDownloadFile } from "./useDownloadFile";


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



function SuccessBody({ result, format }: SuccessBodyProps) {
    const { downloadFile } = useDownloadFile();
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const isDirectUrl = result.isDirectUrl ?? false;
    const ext = isDirectUrl
        ? ".mp4" // CDN URLs don't end in an extension, assume mp4
        : result.downloadUrl.slice(-4); // "/api/files/uuid.mp4" → ".mp4"

    const safeTitle = (result.title ?? "download")
        .replace(/[\\/:*?"<>|]/g, "_")
        .slice(0, 80);
    const filename = `${safeTitle}${ext}`;

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            await downloadFile(result.downloadUrl, filename, isDirectUrl);
        } catch (err: any) {
            setSaveError("Download failed. Try again.");
        } finally {
            setSaving(false);
        }
    };

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

            {/* Error message if save failed */}
            {saveError && (
                <p className="text-[0.78rem] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
                    {saveError}
                </p>
            )}

            {/* Save button — goes through proxy for FASTER, direct blob for SECURE */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-4 cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[0.88rem] font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
                {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                    : <><ArrowDownToLine size={16} /> Save File</>
                }
            </button>
        </div>
    );
}


export default SuccessBody;