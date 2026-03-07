import { HiX } from "react-icons/hi";
import { getYouTubeUrl } from "@/lib/utils";

interface TrailerModalProps {
  videoKey: string;
  title?: string;
  onClose: () => void;
}

export default function TrailerModal({
  videoKey,
  title,
  onClose,
}: TrailerModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl mx-4 aspect-video rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-foreground hover:text-red-400 transition-colors z-10 cursor-pointer"
        >
          <HiX size={28} />
        </button>
        {title && (
          <p className="absolute -top-10 left-0 text-white text-sm font-medium truncate max-w-[80%]">
            {title}
          </p>
        )}
        <iframe
          src={getYouTubeUrl(videoKey)}
          title={title || "Trailer"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
