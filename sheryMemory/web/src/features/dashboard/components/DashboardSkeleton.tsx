export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-(--bg-base) animate-pulse px-6 pt-24 pb-24 md:ml-56 md:px-10">
      {/* Sidebar Placeholder */}
      <div className="fixed inset-y-0 left-0 hidden w-56 border-r border-(--border-subtle) bg-(--bg-surface) md:block">
        <div className="flex h-16 items-center px-6 border-b border-(--border-subtle)">
          <div className="h-6 w-32 rounded-lg bg-(--bg-elevated)" />
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 w-full rounded-md bg-(--bg-elevated)" />
          ))}
        </div>
      </div>

      {/* Header Placeholder */}
      <div className="fixed top-0 right-0 left-0 h-16 border-b border-(--border-subtle) bg-(--bg-surface) md:left-56 px-6 md:px-10 flex items-center justify-between">
        <div className="h-10 w-full max-w-xl rounded-2xl bg-(--bg-elevated) mr-12" />
        <div className="flex gap-4">
          <div className="h-8 w-8 rounded-full bg-(--bg-elevated)" />
          <div className="h-8 w-8 rounded-full bg-(--bg-elevated)" />
          <div className="h-10 w-10 rounded-full bg-(--bg-elevated)" />
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
        <div className="col-span-1 space-y-10 md:col-span-8">
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-(--bg-elevated)" />
            <div className="h-12 w-64 rounded-xl bg-(--bg-elevated)" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-(--bg-elevated)" />
            ))}
          </div>
        </div>
        <div className="col-span-1 space-y-8 md:col-span-4">
          <div className="h-80 rounded-3xl bg-(--bg-elevated)" />
          <div className="h-64 rounded-3xl bg-(--bg-elevated)" />
        </div>
      </div>
    </div>
  )
}
