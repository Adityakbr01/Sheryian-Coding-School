import { Link } from 'react-router-dom'
import { Trash2, ExternalLink, Calendar } from 'lucide-react'
import type { HighlightWithItem } from '../types/highlights.types'
import { HIGHLIGHT_COLORS } from '../../items/hooks/useHighlight'

interface HighlightCardProps {
  hl: HighlightWithItem
  onDelete: (id: string) => void
}

function getColorName(hex: string): string {
  return HIGHLIGHT_COLORS.find((c) => c.value === hex)?.name || 'Custom'
}

export function HighlightCard({ hl, onDelete }: HighlightCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface) transition-all duration-300 hover:scale-[1.01] hover:shadow-(--border-subtle)/30 hover:shadow-xl">
      {/* Color accent bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: hl.color }}
      />

      <div className="p-5">
        {/* Highlighted Text */}
        <div className="mb-4">
          <p
            className="line-clamp-4 text-sm font-medium leading-relaxed text-(--text-primary)"
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
            onClick={() => onDelete(hl.id)}
            className="rounded-lg p-1.5 text-(--text-muted) transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
            title="Remove highlight"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
