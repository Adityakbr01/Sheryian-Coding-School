import { LayoutGrid, List } from 'lucide-react'

interface CollectionsHeaderProps {
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

export function CollectionsHeader({ viewMode, setViewMode }: CollectionsHeaderProps) {
  return (
    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-[0.2em] text-(--accent) uppercase">
          Knowledge Library
        </span>
        <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-(--text-primary)">
          Collections
        </h2>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) p-1.5">
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            viewMode === 'grid'
              ? 'bg-(--bg-surface) text-(--accent) shadow-sm'
              : 'text-(--text-secondary) hover:text-(--text-primary)'
          }`}
        >
          <LayoutGrid className="h-5 w-5 fill-current" />
          Grid
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            viewMode === 'list'
              ? 'bg-(--bg-surface) text-(--accent) shadow-sm'
              : 'text-(--text-secondary) hover:text-(--text-primary)'
          }`}
        >
          <List className="h-5 w-5" />
          List
        </button>
      </div>
    </div>
  )
}
