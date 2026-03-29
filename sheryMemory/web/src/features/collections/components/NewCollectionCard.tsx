import { FolderPlus } from 'lucide-react'

interface NewCollectionCardProps {
  viewMode: 'grid' | 'list'
  onCreate: () => void
}

export function NewCollectionCard({ viewMode, onCreate }: NewCollectionCardProps) {
  return (
    <div
      onClick={onCreate}
      className={`group relative flex cursor-pointer items-center rounded-2xl border-2 border-dashed border-(--border-subtle) bg-(--bg-surface) transition-all hover:border-(--accent)/40 hover:bg-(--accent)/5 ${
        viewMode === 'grid'
          ? 'h-[280px] flex-col justify-center p-8 text-center'
          : 'h-auto flex-row gap-6 p-6'
      }`}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-(--bg-elevated) text-(--text-secondary) transition-all group-hover:scale-110 group-hover:bg-(--accent) group-hover:text-white">
        <FolderPlus className="h-8 w-8" />
      </div>
      <div>
        <h3 className={`font-manrope text-lg font-bold text-(--text-primary) ${viewMode === 'list' ? 'text-left' : ''}`}>
          New Collection
        </h3>
        <p className={`mt-1 text-sm text-(--text-secondary) ${viewMode === 'list' ? 'text-left' : ''}`}>
          Create a container for your ideas
        </p>
      </div>
    </div>
  )
}
