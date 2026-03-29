import { Search, X, SlidersHorizontal, Filter } from 'lucide-react'
import { CustomSelect } from '../../../components/CustomSelect'
import { HIGHLIGHT_COLORS } from '../../items/hooks/useHighlight'
import type { HighlightsSortBy } from '../types/highlights.types'

interface HighlightsFiltersProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  activeColor: string | null
  onColorChange: (color: string | null) => void
  sortBy: HighlightsSortBy
  onSortChange: (sort: HighlightsSortBy) => void
}

export function HighlightsFilters({
  searchQuery,
  onSearchChange,
  activeColor,
  onColorChange,
  sortBy,
  onSortChange,
}: HighlightsFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search & Sort Row */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search highlights..."
            className="w-full rounded-xl border border-(--border-subtle) bg-(--bg-elevated) py-2.5 pr-8 pl-10 text-sm text-(--text-primary) placeholder-(--text-muted) transition-all outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
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
            onChange={(val) => onSortChange(val as HighlightsSortBy)}
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
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-(--text-muted)" />
        <button
          onClick={() => onColorChange(null)}
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
              onClick={() => onColorChange(activeColor === c.value ? null : c.value)}
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
    </div>
  )
}
