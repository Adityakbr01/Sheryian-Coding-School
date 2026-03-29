export function ItemCardSkeleton() {
  return (
    <div className="animate-pulse flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface) p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded bg-(--bg-elevated)" />
          <div className="h-4 w-12 rounded bg-(--bg-elevated)" />
        </div>
        <div className="h-8 w-8 rounded-lg bg-(--bg-elevated)" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-6 w-full rounded bg-(--bg-elevated)" />
        <div className="h-6 w-3/4 rounded bg-(--bg-elevated)" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-(--bg-elevated)" />
        <div className="h-4 w-5/6 rounded bg-(--bg-elevated)" />
      </div>
      <div className="mt-auto pt-4 border-t border-(--border-subtle) flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-(--bg-elevated)" />
        <div className="h-8 w-8 rounded-full bg-(--bg-elevated)" />
      </div>
    </div>
  )
}

export function ItemsGridSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map(i => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  )
}
