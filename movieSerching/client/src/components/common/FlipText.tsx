import { ReactNode } from "react";

interface FlipTextProps {
  children: ReactNode;
  className?: string;
  hoverClassName?: string;
}

export default function FlipText({
  children,
  className = "",
  hoverClassName = "text-[var(--custom-accentColor)]",
}: FlipTextProps) {
  return (
    <div
      className={`relative overflow-hidden inline-[flex] h-[1.2em] leading-[1.2em] group ${className}`}
    >
      {/* Default Text */}
      <div className="transition-transform duration-300 ease-in-out group-hover:-translate-y-full whitespace-nowrap">
        {children}
      </div>

      {/* Hover Text */}
      <div
        className={`absolute inset-0 translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0 whitespace-nowrap ${hoverClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
