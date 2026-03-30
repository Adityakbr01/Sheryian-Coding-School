import ConfirmDialog from '@/features/items/components/ConfirmDialog'
import { ItemCard } from '@/features/items/components/ItemCard'
import { ItemCardSkeleton } from '@/features/items/components/ItemsSkeleton'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useCollections } from '../../collections/hooks/useCollections'
import { useItems } from '../../items/hooks/useItems'
import { LibraryFilters } from '../components/LibraryFilters'
export function LibraryPage() {
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCollection, setFilterCollection] = useState('all')
  const [page, setPage] = useState(1)

  // Confirmation state for deletion
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const { collections } = useCollections()

  // 4-Layer Architecture: Using useItems hook (Layer 3)
  const {
    items,
    pagination,
    isLoading,
    deleteItem
  } = useItems(
    filterCollection === 'all' || filterCollection === 'uncategorized' ? undefined : filterCollection,
    page,
    12
  )

  // Map dynamic collections for the dropdown
  const collectionOptions = useMemo(() => {
    const base = [
      { value: 'all', label: 'All Collections' },
      { value: 'uncategorized', label: 'Uncategorized' },
    ]
    const dynamic = (collections ?? []).map((c: any) => ({
      value: c.id,
      label: c.name,
    }))
    return [...base, ...dynamic]
  }, [collections])

  const handleDelete = (id: string) => {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      deleteItem(pendingDeleteId) // Optimistic deletion via hook
      setPendingDeleteId(null)
      setConfirmOpen(false)
    }
  }

  // Client-side filtering for Type and Status (syncs with library specific filters)
  const filteredItems = useMemo(() => {
    return (items ?? []).filter((item: any) => {
      const typeMatch = filterType === 'all' || item.type === filterType
      const statusMatch = filterStatus === 'all' || item.status === filterStatus
      const collectionMatch = filterCollection === 'uncategorized' ? !item.collectionId : true
      return typeMatch && statusMatch && collectionMatch
    })
  }, [items, filterType, filterStatus, filterCollection])

  return (
    <div className="flex h-full flex-col gap-6">
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Memory?"
        description="Are you sure you want to delete this memory from your library? This action is optimistic and permanent."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <header className="flex flex-col gap-4">
        <div>
          <span className="mb-2 block text-[11px] font-bold tracking-[0.2em] text-(--text-secondary) uppercase">
            Complete Archive
          </span>
          <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-(--text-primary)">
            Library
          </h2>
        </div>

        <LibraryFilters
          filterType={filterType}
          setFilterType={(val) => { setFilterType(val); setPage(1); }}
          filterStatus={filterStatus}
          setFilterStatus={(val) => { setFilterStatus(val); setPage(1); }}
          filterCollection={filterCollection}
          setFilterCollection={(val) => { setFilterCollection(val); setPage(1); }}
          collectionOptions={collectionOptions}
        />
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item: any, idx: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.4) }}
            >
              <ItemCard
                item={item}
                onDelete={() => handleDelete(item.id)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border-subtle) bg-(--bg-surface)/50 py-20">
          <p className="text-(--text-secondary)">No items found matching your filters.</p>
        </div>
      )}

      {!isLoading && pagination && (pagination.totalPages || 0) > 1 && (
        <div className="mt-4 mb-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-(--text-secondary) bg-(--bg-surface) border border-(--border-subtle) hover:bg-(--bg-elevated) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-(--text-primary)">
            Page {page} of {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
            disabled={page >= (pagination.totalPages || 1)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-(--text-secondary) bg-(--bg-surface) border border-(--border-subtle) hover:bg-(--bg-elevated) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}