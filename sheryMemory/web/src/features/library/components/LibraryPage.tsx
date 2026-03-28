import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Filter } from 'lucide-react'
import { ItemCard } from '../../items/components/ItemsGrid'
import Cookies from 'js-cookie'

const API_URL = 'http://localhost:5000/api'
const getHeaders = () => {
  const token = Cookies.get('token')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

// Basic inline skeleton for the Library view
function SkeletonItemCard() {
  return (
    <div className="flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface) p-6 animate-pulse">
      <div className="mb-4 flex gap-2">
        <div className="h-5 w-16 rounded bg-(--bg-elevated)"></div>
        <div className="h-5 w-16 rounded bg-(--bg-elevated)"></div>
      </div>
      <div className="mb-2 h-6 w-3/4 rounded bg-(--bg-elevated)"></div>
      <div className="mb-6 h-4 w-full rounded bg-(--bg-elevated)"></div>
      <div className="mt-auto h-4 w-1/2 rounded bg-(--bg-elevated)"></div>
    </div>
  )
}

// Define the type since we're using ItemCard
type ItemData = any // fallback for compilation

export function LibraryPage() {
  const [items, setItems] = useState<ItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all') // 'all', 'article', 'video', 'tweet'
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'pending', 'processed'
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      params.append('page', page.toString())
      params.append('limit', '12')

      const res = await fetch(`${API_URL}/items?${params.toString()}`, { headers: getHeaders() })
      const data = await res.json()
      if (data?.data) {
        setItems(data.data.data ? data.data.data : data.data) // handle new pagination structure
        if (data.data.totalPages) setTotalPages(data.data.totalPages)
      } else {
        setItems([])
      }
    } catch (err) {
      console.error('Failed to fetch library items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [filterType, filterStatus, page])

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div>
          <span className="mb-2 block text-[11px] font-bold tracking-[0.2em] text-(--text-secondary) uppercase">
            Complete Archive
          </span>
          <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-(--text-primary)">
            Library
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--border-subtle) bg-(--bg-surface) p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-(--text-muted)" />
            <span className="text-sm font-semibold text-(--text-secondary)">Type:</span>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-1.5 text-sm text-(--text-primary) outline-none focus:border-(--accent)"
            >
              <option value="all">All Types</option>
              <option value="article">Articles</option>
              <option value="video">Videos</option>
              <option value="pdf">PDFs</option>
              <option value="image">Images</option>
              <option value="tweet">Tweets</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-(--text-secondary)">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-1.5 text-sm text-(--text-primary) outline-none focus:border-(--accent)"
            >
              <option value="all">All Status</option>
              <option value="processed">Processed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
           {[...Array(6)].map((_, i) => (
             <SkeletonItemCard key={i} />
           ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ItemCard item={item} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border-subtle) bg-(--bg-surface)/50 py-20">
          <p className="text-(--text-secondary)">No items found matching your filters.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-4 mb-8 flex items-center justify-center gap-4">
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
