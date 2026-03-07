import { HiExclamationCircle, HiRefresh } from "react-icons/hi";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load the content. This might be a temporary issue with our servers.",
  onRetry,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
        <HiExclamationCircle className="text-destructive text-xl shrink-0" />
        <p className="text-sm text-foreground flex-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm font-medium text-[var(--custom-primary)] hover:underline cursor-pointer shrink-0"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fadeInUp">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <HiExclamationCircle className="text-destructive text-4xl" />
      </div>

      {/* Title */}
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
        {title}
      </h2>

      {/* Message */}
      <p className="text-sm md:text-base text-muted-foreground max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--custom-primary)] text-white font-medium text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <HiRefresh className="text-lg" />
          Try Again
        </button>
      )}

      {/* Subtext */}
      <p className="text-xs text-muted-foreground/60 mt-4">
        If the problem persists, please try again later.
      </p>
    </div>
  );
}
