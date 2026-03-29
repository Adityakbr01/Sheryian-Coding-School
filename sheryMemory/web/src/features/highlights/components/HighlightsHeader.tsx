import { Highlighter, Download } from 'lucide-react'

interface HighlightsHeaderProps {
  totalHighlights: number
  hasHighlights: boolean
  onExport: () => void
}

export function HighlightsHeader({ totalHighlights, hasHighlights, onExport }: HighlightsHeaderProps) {
  return (
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
          onClick={onExport}
          disabled={!hasHighlights}
          className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) px-4 py-2 text-xs font-semibold text-(--text-secondary) transition-all hover:border-(--accent)/30 hover:text-(--accent) disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Export Page
        </button>
      </div>
    </div>
  )
}
