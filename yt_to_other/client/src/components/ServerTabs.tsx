// components/ServerTabs.tsx
import { ShieldCheck, Zap } from "lucide-react";
import { DownloadServer } from "../features/downloader/types";

interface Props {
    value: DownloadServer;
    onChange: (server: DownloadServer) => void;
    disabled?: boolean;
}

const SERVERS = [
    { label: "FASTER", value: DownloadServer.FASTER, icon: <Zap size={14} />, available: true },
    { label: "SECURE", value: DownloadServer.SECURE, icon: <ShieldCheck size={14} />, available: true },
];

export function ServerTabs({ value, onChange, disabled }: Props) {
    return (
        <div className="tabs-section">
            <span className="tabs-label">Server</span>
            <div className="server-tabs">
                {SERVERS.map((srv) => (
                    <button
                        key={srv.value}
                        disabled={!srv.available || disabled}
                        onClick={() => srv.available && onChange(srv.value)}
                        className={`srv-btn ${value === srv.value ? "srv-btn--active" : ""} ${!srv.available ? "srv-btn--disabled" : ""}`}
                    >
                        <span className="btn-icon">{srv.icon}</span>
                        <span className="btn-name">{srv.label}</span>
                        {!srv.available && <span className="badge-soon">Soon</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}