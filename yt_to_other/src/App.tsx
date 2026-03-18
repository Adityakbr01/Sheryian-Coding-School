import { ArrowDownToLine, Link2, ShieldCheck, Video, Music, Film, Radio, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";

interface ITab {
  name: string;
  icon: ReactNode;
  isAvailable: boolean;
}

const serversTabs: ITab[] = [
  { name: "FASTER", icon: <Zap size={15} />, isAvailable: true },
  { name: "SECURE", icon: <ShieldCheck size={15} />, isAvailable: true },
];

const contentTabs: ITab[] = [
  { name: "mp4", icon: <Video size={14} />, isAvailable: true },
  { name: "mp3", icon: <Music size={14} />, isAvailable: true },
  { name: "webm", icon: <Film size={14} />, isAvailable: false },
  { name: "ogg", icon: <Radio size={14} />, isAvailable: false },
];

function App() {
  const [server, setServer] = useState("FASTER");
  const [format, setFormat] = useState("mp4");
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState("");
  const [isError, setIsError] = useState(false);

  const handleDownload = () => {
    if (!url.trim()) {
      setOutput("Please paste a valid URL to continue.");
      setIsError(true);
      return;
    }
    setIsError(false);
    setOutput(`Preparing ${format.toUpperCase()} download via ${server} server…`);
  };

  return (
    <div className="page-root">

      <main className="page-main">
        <div className="downloader-card">

          {/* Hero heading */}
          <div className="card-hero">
            <h1 className="card-heading">Download anything.</h1>
            <p className="card-subheading">Paste a link, pick your format, done.</p>
          </div>

          {/* Server tabs */}
          <div className="tabs-section">
            <span className="tabs-label">Server</span>
            <div className="server-tabs">
              {serversTabs.map((srv) => (
                <button
                  key={srv.name}
                  className={`srv-btn ${server === srv.name ? "srv-btn--active" : ""} ${!srv.isAvailable ? "srv-btn--disabled" : ""}`}
                  onClick={() => srv.isAvailable && setServer(srv.name)}
                  disabled={!srv.isAvailable}
                >
                  <span className="btn-icon">{srv.icon}</span>
                  <span className="btn-name">{srv.name}</span>
                  {!srv.isAvailable && <span className="badge-soon">Soon</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Format tabs */}
          <div className="tabs-section">
            <span className="tabs-label">Format</span>
            <div className="format-tabs">
              {contentTabs.map((item) => (
                <button
                  key={item.name}
                  className={`fmt-btn ${format === item.name ? "fmt-btn--active" : ""} ${!item.isAvailable ? "fmt-btn--disabled" : ""}`}
                  onClick={() => item.isAvailable && setFormat(item.name)}
                  disabled={!item.isAvailable}
                >
                  <span className="btn-icon">{item.icon}</span>
                  <span className="btn-name">{item.name.toUpperCase()}</span>
                  {!item.isAvailable && <span className="badge-soon">Soon</span>}
                </button>
              ))}
            </div>
          </div>

          {/* URL input */}
          <div className="input-section">
            <label className="input-label" htmlFor="download-url">Video URL</label>
            <div className="input-shell">
              <Link2 size={16} className="input-icon" />
              <input
                id="download-url"
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => { setUrl(e.target.value); setOutput(""); }}
              />
              {url && (
                <button
                  className="input-clear"
                  onClick={() => { setUrl(""); setOutput(""); }}
                  aria-label="Clear"
                >×</button>
              )}
            </div>
          </div>

          {/* Download button */}
          <button
            className={`download-btn ${!url.trim() ? "download-btn--idle" : ""}`}
            onClick={handleDownload}
          >
            <ArrowDownToLine size={16} />
            <span className="dl-text-wrap">
              <span className="dl-text-default">Download {format.toUpperCase()}</span>
              <span className="dl-text-hover">Download {format.toUpperCase()}</span>
            </span>
          </button>

          {/* Output message */}
          {output && (
            <div className={`output-bar ${isError ? "output-bar--error" : "output-bar--success"}`}>
              <span className="output-dot" />
              <p>{output}</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;