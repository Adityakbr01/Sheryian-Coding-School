import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ItemsGrid } from '../../items/components/ItemsGrid'
import { useCollection } from '../hooks/useCollections'
import { ArrowLeft, FolderOpen, Inbox } from 'lucide-react'

export default function CollectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isUncategorized = id === 'uncategorized' || id === 'undefined' || !id

  useEffect(() => {
    if (id === 'undefined' || !id) {
      navigate('/collections/uncategorized', { replace: true })
    }
  }, [id, navigate])

  const { collection, isLoading } = useCollection(isUncategorized ? '' : id!)

  if (!isUncategorized && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base) p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--accent)"></div>
      </div>
    )
  }

  return (
    <div className="font-body min-h-screen bg-(--bg-base) selection:bg-(--accent)/20">
      <div className="mx-auto w-full max-w-7xl px-6 pt-8 pb-12 md:px-10">
        {/* Navigation / Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-10 flex cursor-pointer items-center gap-2 text-sm font-bold tracking-wide text-(--text-secondary) uppercase transition-colors hover:text-(--accent)"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <div className="mb-10 flex items-center gap-4 border-b border-(--border-subtle) pb-8">
          {isUncategorized ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) text-(--text-muted) shadow-xl">
              <Inbox className="h-8 w-8" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white shadow-xl shadow-[#4648d4]/20">
              <FolderOpen className="h-8 w-8 fill-white/20" />
            </div>
          )}
          <div>
            <h1 className="font-manrope text-4xl font-extrabold tracking-tight text-(--text-primary)">
              {isUncategorized ? 'Uncategorized' : (collection?.name || 'Collection')}
            </h1>
            <p className="mt-2 font-medium text-(--text-secondary)">
              {isUncategorized
                ? 'Items that haven\'t been assigned to any collection yet.'
                : 'Mapping nodes and resources curated within this domain.'}
            </p>
          </div>
        </div>

        {/* Dynamic Masonry Grid mapping explicitly to this Collection */}
        <div className="mt-8">
          <ItemsGrid filter="recent" collectionId={id} />
        </div>
      </div>
    </div>
  )
}
