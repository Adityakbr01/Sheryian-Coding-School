import {
  AlertCircle, ArrowDownToLine,
  Film, Link2, Loader2, Music, Radio,
  ShieldCheck, Video, X, Zap
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import SuccessBody from "./components/SuccessBody";
import { useDownloader } from "./features/downloader/hooks/useDownloader";
import { DownloadFormat, DownloadServer, JobState, type IJobResult } from "./features/downloader/types";

export interface IJobStatusResponse {
  jobId: string;
  state: JobState;
  progress: number;
  result?: IJobResult | null;
  error?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ITab {
  name: string;
  value: string;
  icon: ReactNode;
  isAvailable: boolean;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const SERVER_TABS: ITab[] = [
  { name: "FASTER", value: DownloadServer.FASTER, icon: <Zap size={14} />, isAvailable: true },
  { name: "SECURE", value: DownloadServer.SECURE, icon: <ShieldCheck size={14} />, isAvailable: true },
];

const FORMAT_TABS: ITab[] = [
  { name: "mp4", value: DownloadFormat.MP4, icon: <Video size={14} />, isAvailable: true },
  { name: "mp3", value: DownloadFormat.MP3, icon: <Music size={14} />, isAvailable: true },
  { name: "webm", value: "webm", icon: <Film size={14} />, isAvailable: false },
  { name: "ogg", value: "ogg", icon: <Radio size={14} />, isAvailable: false },
];

const PROGRESS_STEPS = [
  { label: "Queued", at: 0 },
  { label: "Fetching", at: 10 },
  { label: "Downloading", at: 30 },
  { label: "Finalizing", at: 95 },
];


// ─── ServerTabs ───────────────────────────────────────────────────────────────
interface ServerTabsProps {
  value: DownloadServer;
  onChange: (v: DownloadServer) => void;
  disabled?: boolean;
}

function ServerTabs({ value, onChange, disabled }: ServerTabsProps) {
  return (
    <div className="tabs-section">
      <span className="tabs-label">Server</span>
      <div className="server-tabs">
        {SERVER_TABS.map((srv) => (
          <button
            key={srv.value}
            disabled={!srv.isAvailable || disabled}
            onClick={() => srv.isAvailable && onChange(srv.value as DownloadServer)}
            className={`srv-btn ${value === srv.value ? "srv-btn--active" : ""} ${!srv.isAvailable ? "srv-btn--disabled" : ""}`}
          >
            <span className="btn-icon">{srv.icon}</span>
            <span className="btn-name">{srv.name}</span>
            {!srv.isAvailable && <span className="badge-soon">Soon</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── FormatTabs ───────────────────────────────────────────────────────────────
interface FormatTabsProps {
  value: DownloadFormat;
  onChange: (v: DownloadFormat) => void;
  disabled?: boolean;
}

function FormatTabs({ value, onChange, disabled }: FormatTabsProps) {
  return (
    <div className="tabs-section">
      <span className="tabs-label">Format</span>
      <div className="format-tabs">
        {FORMAT_TABS.map((fmt) => (
          <button
            key={fmt.value}
            disabled={!fmt.isAvailable || disabled}
            onClick={() => fmt.isAvailable && onChange(fmt.value as DownloadFormat)}
            className={`fmt-btn ${value === fmt.value ? "fmt-btn--active" : ""} ${!fmt.isAvailable ? "fmt-btn--disabled" : ""}`}
          >
            <span className="btn-icon">{fmt.icon}</span>
            <span className="btn-name">{fmt.name.toUpperCase()}</span>
            {!fmt.isAvailable && <span className="badge-soon">Soon</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── UrlInput ─────────────────────────────────────────────────────────────────
interface UrlInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

function UrlInput({ value, onChange, onSubmit, disabled }: UrlInputProps) {
  return (
    <div className="input-section">
      <label className="input-label" htmlFor="download-url">Video URL</label>
      <div className="input-shell">
        <Link2 size={16} className="input-icon" />
        <input
          id="download-url"
          type="text"
          placeholder="https://youtube.com/watch?v=..."
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !disabled && onSubmit()}
        />
        {value && !disabled && (
          <button className="input-clear" onClick={() => onChange("")} aria-label="Clear">×</button>
        )}
      </div>
    </div>
  );
}

// ─── Dialog: StatusDot ────────────────────────────────────────────────────────
function StatusDot({ color, pulse }: { color: "green" | "red" | "purple"; pulse?: boolean }) {
  const bg = { green: "bg-emerald-500", red: "bg-red-500", purple: "bg-violet-500" }[color];
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {pulse && <span className={`animate-ping absolute inset-0 rounded-full ${bg} opacity-50`} />}
      <span className={`relative rounded-full h-2.5 w-2.5 ${bg}`} />
    </span>
  );
}

// ─── Dialog: LoadingSkeleton ──────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin text-violet-400 shrink-0" size={18} />
        <span className="text-zinc-400 text-sm">Fetching video information…</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-zinc-800 animate-pulse w-3/4" />
        <div className="h-3 rounded bg-zinc-800 animate-pulse w-1/2" />
      </div>
    </div>
  );
}

// ─── Dialog: ErrorBody ────────────────────────────────────────────────────────
function ErrorBody({ message }: { message?: string | null }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle size={26} className="text-red-400" />
      </div>
      <p className="text-[0.82rem] text-red-300/90 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 leading-relaxed break-words w-full">
        {message || "An unknown error occurred. Please try again."}
      </p>
    </div>
  );
}

// ─── Dialog: ProgressBody ─────────────────────────────────────────────────────
function ProgressBody({ progress, state }: { progress: number; state: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-2 text-[0.85rem] font-medium text-violet-400">
          <Loader2 size={14} className="animate-spin" />
          {state === JobState.ACTIVE ? "Downloading…" : "Queued…"}
        </span>
        <span className="text-xl font-bold text-white tabular-nums">{progress}%</span>
      </div>

      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>

      <div className="flex justify-between">
        {PROGRESS_STEPS.map((step) => (
          <div
            key={step.label}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${progress >= step.at ? "text-zinc-400" : "text-zinc-700"}`}
          >
            <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${progress >= step.at ? "bg-violet-500" : "bg-zinc-700"}`} />
            <span className="text-[0.6rem]">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



// ─── DownloadDialog ───────────────────────────────────────────────────────────
interface DownloadDialogProps {
  open: boolean;
  loading: boolean;
  status: IJobStatusResponse | null;
  error: string | null;
  format: DownloadFormat;
  onClose: () => void;
  onCancel: () => void;
}

function DownloadDialog({
  open,
  loading,
  status,
  error,
  format,
  onClose,
  onCancel,
}: DownloadDialogProps) {
  if (!open && !loading) return null;

  const isFailed = !!(error || status?.state === JobState.FAILED);
  const isCompleted =
    status?.state === JobState.COMPLETED && !!status.result;

  const isActive =
    !isFailed &&
    !isCompleted &&
    (status?.state === JobState.ACTIVE ||
      status?.state === JobState.WAITING ||
      (status?.state as string) === "prioritized" ||
      (status?.state as string) === "delayed");

  const isSettled = isFailed || isCompleted;
  const isProcessing = loading || !isSettled;
  const progress = Math.floor(status?.progress ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">

      {/* Modal */}
      <div className="w-full model max-w-[420px] bg-[#111] border border-white/[0.08] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-in slide-in-from-bottom-3 duration-200 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StatusDot
              color={isCompleted ? "green" : isFailed ? "red" : "purple"}
              pulse={isProcessing && !isFailed}
            />
            <h2 className="text-sm font-semibold text-zinc-100">
              {loading && !status
                ? "Processing link…"
                : isFailed
                  ? "Download failed"
                  : isCompleted
                    ? "Ready to save"
                    : isActive
                      ? "Downloading…"
                      : "Connecting…"}
            </h2>
          </div>

          {isSettled && (
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg p-1 hover:bg-white/5"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="min-h-[140px] success-body">
          {loading && !status && <LoadingSkeleton />}

          {isFailed && (
            <ErrorBody message={error || status?.error} />
          )}

          {isActive && (
            <ProgressBody
              progress={progress}
              state={status!.state}
            />
          )}

          {isCompleted && (
            <SuccessBody
              result={status!.result!}
              format={format}
            />
          )}

          {!loading && !status && !isFailed && (
            <div className="flex flex-col items-center gap-3 py-2 text-zinc-500 text-sm">
              <Loader2 className="animate-spin" size={26} />
              Connecting to server…
            </div>
          )}
        </div>

        {/* Footer */}
        {isProcessing && !isFailed && (
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <ShieldCheck size={12} /> Securely processing your file
            </span>

            <button
              onClick={onCancel}
              className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 hover:bg-red-500/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [server, setServer] = useState<DownloadServer>(DownloadServer.FASTER);
  const [format, setFormat] = useState<DownloadFormat>(DownloadFormat.MP4);
  const [url, setUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { startDownload, cancelDownload, status, loading, error, reset } = useDownloader();

  useEffect(() => {
    if (loading || status || error) setDialogOpen(true);
  }, [loading, status, error]);

  const handleDownload = () => {
    if (!url.trim() || loading) return;
    startDownload({ url, format, server });
  };

  const handleClose = () => {
    setDialogOpen(false);
    if (!loading && (status?.state === JobState.COMPLETED || error)) {
      reset();
      setUrl("");
    }
  };

  const handleCancel = () => {
    cancelDownload();
    setDialogOpen(false);
  };

  return (
    <div className="page-root relative">

      <DownloadDialog
        open={dialogOpen}
        loading={loading}
        status={status}
        error={error}
        format={format}
        onClose={handleClose}
        onCancel={handleCancel}
      />

      <main className="page-main relative z-0">
        <div className={`downloader-card transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>

          <div className="card-hero">
            <h1 className="card-heading">Download anything.</h1>
            <p className="card-subheading">Paste a link, pick your format, done.</p>
          </div>

          <ServerTabs value={server} onChange={setServer} disabled={loading} />
          <FormatTabs value={format} onChange={setFormat} disabled={loading} />
          <UrlInput value={url} onChange={setUrl} onSubmit={handleDownload} disabled={loading} />

          <button
            className={`download-btn ${!url.trim() ? "download-btn--idle" : ""}`}
            onClick={handleDownload}
            disabled={!url.trim() || loading}
          >
            <ArrowDownToLine size={16} />
            <span className="dl-text-wrap">
              <span className="dl-text-default">Download {format.toUpperCase()}</span>
              <span className="dl-text-hover">Download {format.toUpperCase()}</span>
            </span>
          </button>

        </div>
      </main>
    </div>
  );
}

export default App;