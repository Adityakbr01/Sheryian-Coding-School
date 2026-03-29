import { useCollections } from '../hooks/useCollections'
import { Rocket, MoreVertical, GripVertical } from 'lucide-react'
import { useState } from 'react'
import { CollectionsHeader } from './CollectionsHeader'
import { NewCollectionCard } from './NewCollectionCard'
import { CollectionCard } from './CollectionCard'
import { UncategorizedCard } from './UncategorizedCard'
import { CollectionsGuide } from './CollectionsGuide'

export function CollectionsGrid() {
  const {
    collections,
    isLoading,
    createCollection,
    updateCollection,
    deleteCollection,
  } = useCollections()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleCreate = () => {
    const name = window.prompt('Enter new collection name:')
    if (name && name.trim().length > 0) createCollection(name)
  }

  const gradients = [
    'bg-linear-to-br from-[#4648d4] to-[#6063ee]',
    'bg-linear-to-br from-[#8127cf] to-[#9c48ea]',
    'bg-linear-to-br from-[#505f76] to-[#767586]',
    'bg-emerald-500',
    'bg-[#f59e0b]',
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--accent)"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-2 pt-8 pb-12 md:px-8">
      <CollectionsHeader viewMode={viewMode} setViewMode={setViewMode} />

      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'
        }
      >
        <NewCollectionCard viewMode={viewMode} onCreate={handleCreate} />

        {collections.map((col: any, i: number) => (
          <CollectionCard
            key={col.id}
            collection={col}
            viewMode={viewMode}
            bgClass={gradients[i % gradients.length]}
            onUpdate={updateCollection}
            onDelete={deleteCollection}
          />
        ))}

        <UncategorizedCard viewMode={viewMode} />

        {/* Empty State / Future Template Card */}
        {collections.length < 2 && viewMode === 'grid' && (
          <div className="group flex h-[280px] flex-col justify-between rounded-2xl border-2 border-transparent bg-(--bg-elevated) p-6 transition-all hover:border-(--accent)/20">
            <div>
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--bg-surface) text-(--text-secondary) shadow-sm">
                  <Rocket className="h-6 w-6" />
                </div>
                <button className="text-(--text-muted) hover:text-(--text-primary)">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <h3 className="font-manrope text-xl font-extrabold text-(--text-primary)">
                Future Projects
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded bg-(--accent)/10 px-2 py-0.5 text-[10px] font-bold text-(--accent) uppercase">
                  Personal
                </span>
                <span className="rounded border border-(--border-subtle) bg-(--bg-surface) px-2 py-0.5 text-[10px] font-bold text-(--text-secondary) uppercase">
                  Upcoming
                </span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-(--text-muted) italic">
                <GripVertical className="h-4 w-4" /> Drop thoughts here
              </div>
              <span className="rounded-full border border-(--border-subtle) bg-(--bg-surface) px-3 py-1 text-xs font-bold tracking-wider text-(--text-muted) uppercase">
                0 Items
              </span>
            </div>
          </div>
        )}
      </div>

      <CollectionsGuide />
    </div>
  )
}

