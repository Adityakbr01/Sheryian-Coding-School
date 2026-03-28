import { useCollections } from '../hooks/useCollections'
import {
  FolderPlus,
  MoreVertical,
  Rocket,
  GripVertical,
  FileText,
  ImageIcon,
  Check,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Inbox,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function CollectionsGrid() {
  const {
    collections,
    isLoading,
    createCollection,
    updateCollection,
    deleteCollection,
  } = useCollections()
  const navigate = useNavigate()
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleCreate = () => {
    const name = window.prompt('Enter new collection name:')
    if (name && name.trim().length > 0) createCollection(name)
  }

  const gradients = [
    'bg-gradient-to-br from-[#4648d4] to-[#6063ee]',
    'bg-gradient-to-br from-[#8127cf] to-[#9c48ea]',
    'bg-gradient-to-br from-[#505f76] to-[#767586]',
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
      {/* Header Section */}
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-[0.2em] text-(--accent) uppercase">
            Knowledge Library
          </span>
          <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-(--text-primary)">
            Collections
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) p-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-(--bg-surface) text-(--accent) shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <LayoutGrid className="h-5 w-5 fill-current" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-(--bg-surface) text-(--accent) shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <List className="h-5 w-5" />
            List
          </button>
        </div>
      </div>

      {/* Dynamic Layout Wrapper */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'
        }
      >
        {/* Action Card: New Collection */}
        <div
          onClick={handleCreate}
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
            <h3
              className={`font-manrope text-lg font-bold text-(--text-primary) ${viewMode === 'list' ? 'text-left' : ''}`}
            >
              New Collection
            </h3>
            <p
              className={`mt-1 text-sm text-(--text-secondary) ${viewMode === 'list' ? 'text-left' : ''}`}
            >
              Create a container for your ideas
            </p>
          </div>
        </div>

        {/* Dynamic Collections Cards */}
        {collections.map((col: any, i: number) => {
          const bgClass = gradients[i % gradients.length]
          return (
            <div
              key={col.id}
              onClick={() => navigate(`/collections/${col.id}`)}
              className={`group relative flex cursor-pointer rounded-2xl border border-(--border-subtle) bg-(--bg-surface)/70 shadow-[0_4px_20px_rgba(70,72,212,0.04)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl ${
                viewMode === 'grid'
                  ? 'h-[280px] flex-col justify-between p-6'
                  : 'h-auto flex-row items-center gap-6 p-4 md:p-6'
              }`}
            >
              <div
                className={`relative flex justify-between ${viewMode === 'grid' ? 'mb-6 w-full items-start' : 'shrink-0 items-center'}`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg ${bgClass}`}
                >
                  <FolderPlus className="h-6 w-6 fill-[white]/20" />
                </div>

                {/* Replaces naked button with active toggle menu */}
                {viewMode === 'grid' && (
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenuId(activeMenuId === col.id ? null : col.id)
                      }}
                      className="rounded-lg p-1.5 text-(--text-muted) transition-colors hover:bg-(--bg-elevated) hover:text-(--text-primary)"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {activeMenuId === col.id && (
                      <div className="absolute top-10 right-0 z-20 w-40 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-1 py-2 shadow-2xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(null)
                            const newName = window.prompt(
                              'Edit Collection name:',
                              col.name,
                            )
                            if (newName && newName.trim().length > 0)
                              updateCollection({ id: col.id, name: newName })
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--bg-overlay) hover:text-(--accent)"
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(null)
                            if (
                              window.confirm(
                                `Delete collection "${col.name}"? This action cannot be undone.`,
                              )
                            )
                              deleteCollection(col.id)
                          }}
                          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-(--error-text) transition-colors hover:bg-[#ffdad6]"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className={viewMode === 'list' ? 'min-w-0 flex-1' : 'flex-1'}
              >
                <h3
                  className={`font-manrope font-extrabold text-(--text-primary) transition-colors group-hover:text-(--accent) ${viewMode === 'grid' ? 'text-xl' : 'truncate text-lg'}`}
                >
                  {col.name}
                </h3>
                <p
                  className={`mt-1 text-sm text-(--text-secondary) ${viewMode === 'grid' ? 'mt-2 line-clamp-2 leading-relaxed' : 'truncate'}`}
                >
                  Curated thoughts and structured links regarding{' '}
                  {col.name.toLowerCase()}.
                </p>
              </div>

              <div
                className={`flex items-center justify-between ${viewMode === 'grid' ? 'mt-6 w-full' : 'ml-auto shrink-0 gap-6'}`}
              >
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
                  {col._count?.items || 0} Items
                </span>

                {viewMode === 'list' && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenuId(activeMenuId === col.id ? null : col.id)
                      }}
                      className="rounded-lg p-2 text-(--text-muted) transition-colors hover:bg-(--bg-elevated) hover:text-(--text-primary)"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {activeMenuId === col.id && (
                      <div className="absolute top-10 right-0 z-20 w-40 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-1 py-2 shadow-2xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(null)
                            const newName = window.prompt(
                              'Edit Collection name:',
                              col.name,
                            )
                            if (newName && newName.trim().length > 0)
                              updateCollection({ id: col.id, name: newName })
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--bg-overlay) hover:text-(--accent)"
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(null)
                            if (
                              window.confirm(
                                `Delete collection "${col.name}"? This action cannot be undone.`,
                              )
                            )
                              deleteCollection(col.id)
                          }}
                          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-(--error-text) transition-colors hover:bg-[#ffdad6]"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Uncategorized Card */}
        <div
          onClick={() => navigate('/collections/uncategorized')}
          className={`group relative flex cursor-pointer rounded-2xl border border-dashed border-(--border-subtle) bg-(--bg-surface)/50 transition-all hover:-translate-y-1 hover:border-(--accent)/30 hover:shadow-xl ${
            viewMode === 'grid'
              ? 'h-[280px] flex-col justify-between p-6'
              : 'h-auto flex-row items-center gap-6 p-4 md:p-6'
          }`}
        >
          <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'mb-4' : ''}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--bg-elevated) text-(--text-muted) shadow-sm transition-colors group-hover:border-(--accent)/30 group-hover:text-(--accent)">
              <Inbox className="h-6 w-6" />
            </div>
          </div>
          <div className={viewMode === 'list' ? 'min-w-0 flex-1' : 'flex-1'}>
            <h3 className={`font-manrope font-extrabold text-(--text-primary) transition-colors group-hover:text-(--accent) ${viewMode === 'grid' ? 'text-xl' : 'truncate text-lg'}`}>
              Uncategorized
            </h3>
            <p className={`mt-1 text-sm text-(--text-secondary) ${viewMode === 'grid' ? 'mt-2 line-clamp-2 leading-relaxed' : 'truncate'}`}>
              Items that haven't been assigned to any collection yet.
            </p>
          </div>
          <div className={`flex items-center ${viewMode === 'grid' ? 'mt-6 w-full justify-end' : 'ml-auto shrink-0'}`}>
            <span className="rounded-full bg-(--text-muted)/10 px-3 py-1 text-xs font-bold tracking-wider text-(--text-muted) uppercase">
              Unsorted
            </span>
          </div>
        </div>

        {/* Empty State / Future Template Card */}
        {collections.length < 2 && (
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

      {/* Drag and Drop Guide Overlay */}
      <div className="mt-16 flex flex-col items-center gap-10 rounded-3xl border border-(--border-subtle) bg-(--bg-surface) p-8 md:flex-row">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) md:w-1/3">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4648d4] to-[#6063ee] opacity-20"></div>
          <div className="relative z-10 flex gap-4">
            <div className="flex h-14 w-12 animate-pulse items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-surface) shadow-xl">
              <FileText className="h-6 w-6 text-(--accent)" />
            </div>
            <div className="flex h-14 w-12 rotate-6 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-surface)/60 shadow-sm">
              <ImageIcon className="h-6 w-6 text-(--text-muted)" />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <h4 className="font-manrope text-2xl font-bold text-(--text-primary)">
            Effortless Organization
          </h4>
          <p className="max-w-xl leading-relaxed text-(--text-secondary)">
            Drag any note, bookmark, or media directly onto a collection card to
            categorize it instantly. Use the 'New Thought' button to capture
            ideas before they escape, then move them here when you're ready to
            curate.
          </p>
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent)/10 text-(--accent)">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-(--text-secondary)">
                Smart Auto-Tagging
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent)/10 text-(--accent)">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-(--text-secondary)">
                Batch Sorting
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
