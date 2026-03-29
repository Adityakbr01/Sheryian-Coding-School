import { Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UncategorizedCardProps {
  viewMode: 'grid' | 'list'
}

export function UncategorizedCard({ viewMode }: UncategorizedCardProps) {
  const navigate = useNavigate()

  return (
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
  )
}
