import React from "react";

export default function SearchEmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center py-20">
      {icon}
      <p className="text-foreground text-lg font-medium">{title}</p>
      <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
    </div>
  );
}
