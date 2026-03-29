import type { GraphNode } from '../types/graph.types'

const NODE_COLORS: Record<string, string> = {
  video: '#ef4444',
  article: '#3b82f6',
  tweet: '#1da1f2',
  pdf: '#f97316',
  tag: '#a855f7',
  default: '#8b5cf6',
}

interface GraphTooltipProps {
  node: GraphNode
  formatLabel: (name: string) => string
  position: {
    x: number
    y: number
  }
}

export function GraphTooltip({ node, formatLabel, position }: GraphTooltipProps) {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  const tooltipWidth = 280
  const left = Math.max(12, Math.min(position.x + 16, viewportWidth - tooltipWidth - 12))
  const top = Math.max(88, Math.min(position.y + 16, viewportHeight - 130))

  return (
    <div
      className="pointer-events-none absolute z-20 w-[min(70vw,17.5rem)] rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/95 px-3 py-2 shadow-xl backdrop-blur-md"
      style={{ left, top }}
    >
      <div className="mb-1 flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor:
              node.color ||
              NODE_COLORS[node.type] ||
              NODE_COLORS.default,
          }}
        />
        <span className="text-[9px] font-bold tracking-wider text-(--text-muted) uppercase">
          {node.type}
        </span>
      </div>
      <h4 className="line-clamp-2 text-xs leading-snug font-bold text-(--text-primary)">
        {formatLabel(node.name)}
      </h4>

      {node.summary && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-(--text-secondary)">
          {node.summary}
        </p>
      )}

      <p className="mt-1.5 text-[10px] text-(--text-muted) italic">
        {node.nodeType === 'item'
          ? 'Click to open details panel'
          : 'Click to browse connected items'}
      </p>
    </div>
  )
}
