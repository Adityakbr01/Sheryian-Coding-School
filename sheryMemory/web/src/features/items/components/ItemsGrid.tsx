import { useState } from 'react'
// Simple reusable confirm dialog

import { useItems } from '../hooks/useItems'
import type { Item } from '../types/items.types'

import ConfirmDialog from './ConfirmDialog'
import { ItemCard } from './ItemCard'
import { ItemsGridSkeleton } from './ItemsSkeleton'

export function ItemsGrid({
  filter = 'recent',
  collectionId,
}: {
  filter?: 'recent' | 'relevant'
  collectionId?: string
}) {
  const [page, setPage] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const { items, pagination, isLoading, deleteItem } = useItems(collectionId, page, 12)
  // Optimistic state is now handled by React Query in useItems
  const currentItems = items

  if (isLoading) {
    return <ItemsGridSkeleton />
  }

  const handleDelete = (id: string) => {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      deleteItem(pendingDeleteId)
      setPendingDeleteId(null)
      setConfirmOpen(false)
    }
  }

  const handleCancelDelete = () => {
    setPendingDeleteId(null)
    setConfirmOpen(false)
  }

  const displayedItems = [...(currentItems ?? [])].sort((a, b) => {
    if (filter === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      // Relevance heuristic: surface old/forgotten tags over newest ones (Resurfacing mechanic)
      const aScore =
        ((a as any).reviewCount || 0) * 1000 + new Date(a.createdAt).getTime()
      const bScore =
        ((b as any).reviewCount || 0) * 1000 + new Date(b.createdAt).getTime()
      return aScore - bScore
    }
  })

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Memory?"
        description="Are you sure you want to delete this memory? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <div className="flex flex-col gap-6">
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {displayedItems.map((item: Item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>

        {pagination && (pagination.totalPages || 0) > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
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
    </>
  )
}


