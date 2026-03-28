import { useState } from 'react'
import type { Item } from '../types/items.types'
import { useItems } from '../hooks/useItems'
import {
  ExternalLink,
  Trash2,
  Video,
  FileText,
  Link as LinkIcon,
  X,
  ImageIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import appInfo from '@/constants/appInfo'

export function ItemsGrid({
  filter = 'recent',
  collectionId,
}: {
  filter?: 'recent' | 'relevant'
  collectionId?: string
}) {
  const [page, setPage] = useState(1)
  const { items, pagination, isLoading, deleteItem } = useItems(collectionId, page, 12)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-(--text-secondary)">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--accent)"></div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border-2 border-dashed border-(--border-default) bg-(--bg-surface) p-16 text-center">
        <h3 className="mb-2 text-xl font-bold text-(--text-primary)">
          No memories yet
        </h3>
        <p className="text-(--text-secondary)">
          Save your first URL to start building your {appInfo.NAME}.
        </p>
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      deleteItem(id)
    }
  }

  const displayedItems = [...items].sort((a, b) => {
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
  )
}

export function ItemCard({ item, onDelete }: { item: Item; onDelete?: () => void }) {
  const TypeIcon = () => {
    switch (item.type) {
      case 'video':
        return <Video className="mr-1 h-3 w-3" />
      case 'article':
      case 'pdf':
        return <FileText className="mr-1 h-3 w-3" />
      case 'image':
        return <ImageIcon className="mr-1 h-3 w-3" />
      case 'tweet':
        return <X className="mr-1 h-3 w-3" />
      default:
        return <LinkIcon className="mr-1 h-3 w-3" />
    }
  }

  return (
    <article className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface) transition-all duration-300 hover:shadow-(--border-strong)/10 hover:shadow-xl">
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex gap-2">
            <span
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                item.status === 'processed'
                  ? 'bg-(--success-bg) text-(--success-text)'
                  : item.status === 'failed'
                    ? 'bg-(--error-bg) text-(--error-text)'
                    : 'bg-[#fbbf24]/10 text-[#d97706]'
              }`}
            >
              {item.status}
            </span>
            <span className="flex items-center rounded-md border border-(--tab-border) bg-(--tab-bg) px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--tab-text) uppercase">
              <TypeIcon />
              {item.type}
            </span>
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="z-10 cursor-pointer rounded-lg p-1 text-(--text-muted) transition-colors hover:bg-(--error-bg) hover:text-(--error-text)"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <Link to={`/items/${item.id}`}>
          <h3 className="font-manrope mb-2 cursor-pointer text-lg leading-snug font-bold text-(--text-primary) transition-colors group-hover:text-(--accent)">
            {item.title || item.url}
          </h3>
        </Link>

        {item.content && (
          <p className="mb-6 line-clamp-2 text-sm text-(--text-secondary) opacity-90">
            {item.content}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-(--border-subtle) pt-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-wider text-(--text-muted) uppercase">
              Added to memory
            </span>
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-transparent text-(--text-secondary) transition-colors hover:border-(--border-subtle) hover:bg-(--bg-elevated) hover:text-(--accent)"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  )
}
