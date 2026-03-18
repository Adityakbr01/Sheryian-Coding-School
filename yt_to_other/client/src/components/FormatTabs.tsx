// components/FormatTabs.tsx
import { Film, Music, Radio, Video } from "lucide-react";
import { DownloadFormat } from "../features/downloader/types";

interface Props {
    value: DownloadFormat;
    onChange: (format: DownloadFormat) => void;
    disabled?: boolean;
}

const FORMATS = [
    { label: "MP4", value: DownloadFormat.MP4, icon: <Video size={14} />, available: true },
    { label: "MP3", value: DownloadFormat.MP3, icon: <Music size={14} />, available: true },
    { label: "WEBM", value: "webm", icon: <Film size={14} />, available: false },
    { label: "OGG", value: "ogg", icon: <Radio size={14} />, available: false },
];

export function FormatTabs({ value, onChange, disabled }: Props) {
    return (
        <div className="tabs-section">
            <span className="tabs-label">Format</span>
            <div className="format-tabs">
                {FORMATS.map((fmt) => (
                    <button
                        key={fmt.value}
                        disabled={!fmt.available || disabled}
                        onClick={() => fmt.available && onChange(fmt.value as DownloadFormat)}
                        className={`fmt-btn ${value === fmt.value ? "fmt-btn--active" : ""} ${!fmt.available ? "fmt-btn--disabled" : ""}`}
                    >
                        <span className="btn-icon">{fmt.icon}</span>
                        <span className="btn-name">{fmt.label}</span>
                        {!fmt.available && <span className="badge-soon">Soon</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}