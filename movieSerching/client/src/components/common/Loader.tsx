export default function Loader({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-2",
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div
        className={`
          ${sizeMap[size]}
          rounded-full
          border-muted
          border-t-[var(--custom-primary)]
          animate-spin
        `}
      />
    </div>
  );
}
