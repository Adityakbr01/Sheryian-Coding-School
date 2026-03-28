import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import {
  Highlighter,
  Trash2,
  Download,
  Search,
  X,
  Filter,
  Calendar,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react'
import { HIGHLIGHT_COLORS } from '../features/items/hooks/useHighlight'
import { CustomSelect } from '../components/CustomSelect'

// ── Types ─────────────────────────────────────────────────────────
interface HighlightWithItem {
  id: string
  itemId: string
  userId: string
  text: string
  start: number
  end: number
  color: string
  createdAt: string
  item: {
    id: string
    title: string | null
    url: string
    type: string
    imageUrl: string | null
  }
}

const API_URL = 'http://localhost:5000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${Cookies.get('token') || ''}`,
})

// ── API ───────────────────────────────────────────────────────────
const highlightsApi = {
  getAll: async (color?: string, page?: number, limit?: number, search?: string, sortBy?: string): Promise<{ data: HighlightWithItem[], totalPages: number, total: number }> => {
    const url = new URL(`${API_URL}/highlights`)
    if (color) url.searchParams.append('color', color)
    if (page) url.searchParams.append('page', page.toString())
    if (limit) url.searchParams.append('limit', limit.toString())
    if (search) url.searchParams.append('search', search)
    if (sortBy) url.searchParams.append('sortBy', sortBy)

    const res = await fetch(url.toString(), { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch highlights')
    const json = await res.json()
    // new api returns { data: { data, total, page, totalPages } }
    return { data: json.data.data || json.data, totalPages: json.data.totalPages || 1, total: json.data.total || 0 }
  },
  remove: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/highlights/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete highlight')
  },
}

// ── Color name lookup ─────────────────────────────────────────────
function getColorName(hex: string): string {
  return HIGHLIGHT_COLORS.find((c) => c.value === hex)?.name || 'Custom'
}

// ── Main Component ────────────────────────────────────────────────
export function HighlightsPage() {
  const queryClient = useQueryClient()
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'color'>('newest')
  const [page, setPage] = useState(1)

  // Fetch paginated highlights
  const { data: highlightsResponse, isLoading } = useQuery({
    queryKey: ['highlights-all', activeColor, page, searchQuery, sortBy],
    queryFn: () => highlightsApi.getAll(activeColor || undefined, page, 12, searchQuery, sortBy),
    staleTime: 30 * 1000,
  })

  const highlights = highlightsResponse?.data || []
  const totalPages = highlightsResponse?.totalPages || 1
  const totalHighlights = highlightsResponse?.total || 0

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: highlightsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights-all'] })
    },
  })

  // ── Export all ─────────────────────────────────────────────
  const handleExport = () => {
    const exportData = highlights.map((h) => ({
      text: h.text,
      color: h.color,
      itemTitle: h.item.title,
      date: new Date(h.createdAt).toISOString(),
    }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-highlights.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-2 pt-4 pb-12 md:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-(--accent) to-(--accent) shadow-lg">
              <Highlighter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-manrope text-2xl font-extrabold tracking-tight text-(--text-primary)">
                Highlights
              </h2>
              <p className="text-xs text-(--text-secondary)">
                {totalHighlights} saved highlight
                {totalHighlights !== 1 ? 's' : ''} across your brain
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={highlights.length === 0}
            className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) px-4 py-2 text-xs font-semibold text-(--text-secondary) transition-all hover:border-(--accent)/30 hover:text-(--accent) disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Export Page
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search highlights..."
            className="w-full rounded-xl border border-(--border-subtle) bg-(--bg-elevated) py-2.5 pr-8 pl-10 text-sm text-(--text-primary) placeholder-(--text-muted) transition-all outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/50"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setPage(1); }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex z-10 items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-(--text-muted)" />
          <CustomSelect
            value={sortBy}
            onChange={(val) => { setSortBy(val as any); setPage(1); }}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'color', label: 'Group by Color' },
            ]}
            align="right"
            className="w-44 shrink-0"
          />
        </div>
      </div>

      {/* Color Filter Pills */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-(--text-muted)" />
        <button
          onClick={() => { setActiveColor(null); setPage(1); }}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${!activeColor
              ? 'bg-(--accent) text-white shadow-(--accent)/20 shadow-lg'
              : 'border border-(--border-subtle) bg-(--bg-elevated) text-(--text-secondary) hover:border-(--accent)/30'
            }`}
        >
          All
        </button>
        {HIGHLIGHT_COLORS.map((c) => {
          return (
            <button
              key={c.value}
              onClick={() => {
                setActiveColor(activeColor === c.value ? null : c.value)
                setPage(1)
              }}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${activeColor === c.value
                  ? 'shadow-md ring-2 ring-offset-2 ring-offset-(--bg-base)'
                  : 'border border-(--border-subtle) bg-(--bg-elevated) hover:border-(--accent)/30'
                }`}
              style={
                activeColor === c.value
                  ? {
                    backgroundColor: c.value,
                    color: '#1e293b',
                  }
                  : {}
              }
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: c.value }}
              />
              <span
                className={
                  activeColor === c.value
                    ? 'text-slate-800'
                    : 'text-(--text-secondary)'
                }
              >
                {c.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--accent)" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && highlights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Highlighter className="mb-4 h-12 w-12 text-(--text-muted)" />
          <h3 className="mb-2 text-lg font-bold text-(--text-primary)">
            {searchQuery || activeColor
              ? 'No matching highlights'
              : 'No highlights yet'}
          </h3>
          <p className="max-w-sm text-sm text-(--text-secondary)">
            {searchQuery || activeColor
              ? 'Try adjusting your filters or search query.'
              : 'Open any item and select text to start highlighting. Your highlights will appear here.'}
          </p>
        </div>
      )}

      {/* Highlights Grid */}
      {!isLoading && highlights.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((hl) => (
            <div
              key={hl.id}
              className="group relative overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface) transition-all duration-300 hover:scale-[1.01] hover:shadow-(--border-subtle)/30 hover:shadow-xl"
            >
              {/* Color accent bar */}
              <div
                className="h-1 w-full"
                style={{ backgroundColor: hl.color }}
              />

              <div className="p-5">
                {/* Highlighted Text */}
                <div className="mb-4">
                  <p
                    className="line-clamp-4 text-sm leading-relaxed font-medium text-(--text-primary)"
                    style={{
                      borderLeft: `3px solid ${hl.color}`,
                      paddingLeft: '12px',
                    }}
                  >
                    "{hl.text}"
                  </p>
                </div>

                {/* Source Item */}
                <Link
                  to={`/items/${hl.item.id}`}
                  className="group/link mb-3 flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3 text-(--text-muted) group-hover/link:text-(--accent)" />
                  <span className="truncate text-xs font-medium text-(--text-secondary) transition-colors group-hover/link:text-(--accent)">
                    {hl.item.title || hl.item.url}
                  </span>
                </Link>

                {/* Meta Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: hl.color }}
                    />
                    <span className="text-[10px] font-bold tracking-wide text-(--text-muted) uppercase">
                      {getColorName(hl.color)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-(--text-muted)">
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(hl.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteMutation.mutate(hl.id)}
                    className="rounded-lg p-1.5 text-(--text-muted) opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                    title="Remove highlight"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-(--text-secondary) bg-(--bg-surface) border border-(--border-subtle) hover:bg-(--bg-elevated) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-(--text-primary)">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg px-4 py-2 text-sm font-medium text-(--text-secondary) bg-(--bg-surface) border border-(--border-subtle) hover:bg-(--bg-elevated) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
