import { FolderPlus, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface CollectionCardProps {
  collection: any
  viewMode: 'grid' | 'list'
  bgClass: string
  onUpdate: (data: { id: string; name: string }) => void
  onDelete: (id: string) => void
}

export function CollectionCard({ 
  collection, 
  viewMode, 
  bgClass, 
  onUpdate, 
  onDelete 
}: CollectionCardProps) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    const newName = window.prompt('Edit Collection name:', collection.name)
    if (newName && newName.trim().length > 0) {
      onUpdate({ id: collection.id, name: newName })
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    if (window.confirm(`Delete collection "${collection.name}"? This action cannot be undone.`)) {
      onDelete(collection.id)
    }
  }

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const Menu = () => (
    <div className="absolute top-10 right-0 z-20 w-40 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-1 py-2 shadow-2xl">
      <button
        onClick={handleEdit}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--bg-overlay) hover:text-(--accent)"
      >
        <Edit2 className="h-4 w-4" /> Edit
      </button>
      <button
        onClick={handleDelete}
        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-(--error-text) transition-colors hover:bg-[#ffdad6]"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    </div>
  )

  return (
    <div
      onClick={() => navigate(`/collections/${collection.id}`)}
      className={`group relative flex cursor-pointer rounded-2xl border border-(--border-subtle) bg-(--bg-surface)/70 shadow-[0_4px_20px_rgba(70,72,212,0.04)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl ${
        viewMode === 'grid'
          ? 'h-[280px] flex-col justify-between p-6'
          : 'h-auto flex-row items-center gap-6 p-4 md:p-6'
      }`}
    >
      <div className={`relative flex justify-between ${viewMode === 'grid' ? 'mb-6 w-full items-start' : 'shrink-0 items-center'}`}>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg ${bgClass}`}>
          <FolderPlus className="h-6 w-6 fill-[white]/20" />
        </div>

        {viewMode === 'grid' && (
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="rounded-lg p-1.5 text-(--text-muted) transition-colors hover:bg-(--bg-elevated) hover:text-(--text-primary)"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {isMenuOpen && <Menu />}
          </div>
        )}
      </div>

      <div className={viewMode === 'list' ? 'min-w-0 flex-1' : 'flex-1'}>
        <h3 className={`font-manrope font-extrabold text-(--text-primary) transition-colors group-hover:text-(--accent) ${viewMode === 'grid' ? 'text-xl' : 'truncate text-lg'}`}>
          {collection.name}
        </h3>
        <p className={`mt-1 text-sm text-(--text-secondary) ${viewMode === 'grid' ? 'mt-2 line-clamp-2 leading-relaxed' : 'truncate'}`}>
          Curated thoughts and structured links regarding {collection.name.toLowerCase()}.
        </p>
      </div>

      <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'mt-6 w-full' : 'ml-auto shrink-0 gap-6'}`}>
        {viewMode === 'grid' && (
          <div className="flex -space-x-2">
            <div className="h-6 w-6 overflow-hidden rounded-full border-2 border-(--bg-surface) bg-slate-100">
              <img
                alt="User"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0jz_yEyjS9IyOE9i2iS3k6s5cdlzAd1sH9k6CJg-zW7KzIMtZADwLFt8jXfix6bdncByTQt6SlfSXgBHx78frZzXv0efxWuI0ErHVSGpYtAwCi2zktyrH-ijBUvOZMgJ5yE4i_xuF6bYPTH6KwxHWsyskOMWdoSUcGGM2ktMjqs5rgDPP4M800yi6TA0VXkvWnn0_kmKdY4-X60exlSBvJASwJbSji4uF2nZS5ZRhrDkHSCc_TK4y_aNss2Fs0fSa0oudawJBHX4"
              />
            </div>
          </div>
        )}
        <span className="rounded-full bg-(--accent)/10 px-3 py-1 text-xs font-bold tracking-wider text-(--accent) uppercase">
          {collection._count?.items || 0} Items
        </span>

        {viewMode === 'list' && (
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="rounded-lg p-2 text-(--text-muted) transition-colors hover:bg-(--bg-elevated) hover:text-(--text-primary)"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {isMenuOpen && <Menu />}
          </div>
        )}
      </div>
    </div>
  )
}
