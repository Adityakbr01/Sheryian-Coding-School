import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { Filter } from 'lucide-react'
import { ItemCard } from '../../items/components/ItemsGrid'
import Cookies from 'js-cookie'
import { CustomSelect } from '../../../components/CustomSelect'
import { useCollections } from '../../collections/hooks/useCollections'

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
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCollection, setFilterCollection] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { collections } = useCollections()

  const collectionOptions = useMemo(() => [
    { value: 'all', label: 'All Collections' },
    { value: 'uncategorized', label: 'Uncategorized' },
  ], [collections])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCollection !== 'all') params.append('collectionId', filterCollection)
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
  }, [filterType, filterStatus, filterCollection, page])

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
            <CustomSelect
              value={filterType}
              onChange={(val) => { setFilterType(val); setPage(1); }}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'article', label: 'Articles' },
                { value: 'video', label: 'Videos' },
                { value: 'pdf', label: 'PDFs' },
                { value: 'image', label: 'Images' },
                { value: 'tweet', label: 'Tweets' },
              ]}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-(--text-secondary)">Status:</span>
            <CustomSelect
              value={filterStatus}
              onChange={(val) => { setFilterStatus(val); setPage(1); }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'processed', label: 'Processed' },
                { value: 'pending', label: 'Pending' },
              ]}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-(--text-secondary)">Collection:</span>
            <CustomSelect
              value={filterCollection}
              onChange={(val) => { setFilterCollection(val); setPage(1); }}
              options={collectionOptions}
              className="w-48"
            />
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
