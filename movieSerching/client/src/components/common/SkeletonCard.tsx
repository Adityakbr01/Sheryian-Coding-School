export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border/50">
      <div className="aspect-2/3 skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative h-[70vh] skeleton rounded-none">
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <div className="h-8 skeleton w-96 max-w-full" />
        <div className="h-4 skeleton w-64 max-w-full" />
        <div className="h-4 skeleton w-full max-w-2xl" />
        <div className="flex gap-3">
          <div className="h-10 w-32 skeleton rounded-lg" />
          <div className="h-10 w-32 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}
