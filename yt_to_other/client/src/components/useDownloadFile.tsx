import { API_BASE } from "@/App";

export function useDownloadFile() {
    const downloadBlob = async (url: string, filename: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    };

    const downloadFile = async (
        downloadUrl: string,
        filename: string,
        isDirectUrl: boolean,
    ) => {
        const apiBase = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;

        if (isDirectUrl) {
            // ✅ Let the browser hit Google CDN directly — same IP, no proxy needed.
            // Use 'a' tag with target="_blank" as fallback if CORS blocks blob fetch.
            try {
                await downloadBlob(downloadUrl, filename);
            } catch {
                // Fallback: browser-native download (no blob, no CORS issue)
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = filename;
                a.target = "_blank";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            return;
        }

        // Non-direct: proxy through backend as before
        let fullUrl = "";
        if (apiBase.endsWith("/api") && downloadUrl.startsWith("/api/")) {
            fullUrl = apiBase + downloadUrl.substring(4);
        } else {
            fullUrl = apiBase + (downloadUrl.startsWith("/") ? "" : "/") + downloadUrl;
        }
        if (downloadUrl.startsWith("http")) fullUrl = downloadUrl;

        await downloadBlob(fullUrl, filename);
    };

    return { downloadFile };
}