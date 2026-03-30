import {
  Activity,
  ArrowRight, ChevronRight,
  Link2,
  LocateFixed,
  Maximize,
  Network,
  Orbit,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useNavigate } from 'react-router-dom'
import { useGraph } from '../hooks/useGraph'
import type { GraphLink, GraphNode } from '../types/graph.types'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  video: '#ef4444',
  article: '#3b82f6',
  tweet: '#1da1f2',
  pdf: '#f97316',
  tag: '#a855f7',
  default: '#8b5cf6',
}

const NODE_LABELS: Record<string, string> = {
  video: 'Video', article: 'Article', tweet: 'Tweet',
  pdf: 'PDF', tag: 'Tag', default: 'Item',
}

const LINK_COLORS: Record<string, string> = {
  strong: '#22c55e',
  medium: '#3b82f6',
  weak: 'rgba(100,116,139,0.25)',
  tag: 'rgba(168,85,247,0.2)',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function nodeColor(node: GraphNode) {
  return node.color || NODE_COLORS[node.type] || NODE_COLORS.default
}

function formatLabel(name: string) {
  if (!name) return ''
  return name.split('|')[0].trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: GraphTooltip
// ─────────────────────────────────────────────────────────────────────────────

interface GraphTooltipProps {
  node: GraphNode
  position: { x: number; y: number }
}

function GraphTooltip({ node, position }: GraphTooltipProps) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const W = 272
  const left = Math.max(12, Math.min(position.x + 20, vw - W - 12))
  const top = Math.max(88, Math.min(position.y - 8, vh - 180))
  const color = nodeColor(node)
  const typeLabel = NODE_LABELS[node.type] || node.type

  return (
    <div className="pointer-events-none absolute z-20" style={{ left, top, width: W }}>
      <div
        className="relative overflow-hidden rounded-2xl border bg-(--bg-surface)/98 shadow-2xl backdrop-blur-xl"
        style={{ borderColor: `${color}28` }}
      >
        {/* Top accent bar */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${color}cc, ${color}22)` }}
        />

        <div className="px-4 pt-4 pb-3.5">
          {/* Badge */}
          <div className="mb-2.5 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[9px] font-semibold tracking-[0.12em] uppercase" style={{ color }}>
              {typeLabel}
            </span>
          </div>

          {/* Title */}
          <h4 className="line-clamp-2 text-[13px] font-semibold leading-snug text-(--text-primary)">
            {formatLabel(node.name)}
          </h4>

          {/* Summary */}
          {node.summary && (
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-(--text-secondary)">
              {node.summary}
            </p>
          )}

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {node.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                  style={{ background: `${color}12`, color: `${color}cc` }}
                >
                  {tag}
                </span>
              ))}
              {node.tags.length > 4 && (
                <span className="rounded-full px-2 py-0.5 text-[9px] font-medium text-(--text-muted)">
                  +{node.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center gap-1.5 border-t border-(--border-subtle) pt-2.5">
            <div className="h-px flex-1" style={{ background: `${color}20` }} />
            <span className="text-[9px] text-(--text-muted)">
              {node.nodeType === 'item' ? 'click to open' : 'click to explore'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: GraphNodeDialog (pinned detail panel)
// ─────────────────────────────────────────────────────────────────────────────

interface GraphNodeDialogProps {
  node: GraphNode | null
  relatedItemNodes: GraphNode[]
  onClose: () => void
  onOpenItem: (id: string) => void
}

function GraphNodeDialog({ node, relatedItemNodes, onClose, onOpenItem }: GraphNodeDialogProps) {
  if (!node) return null
  const color = nodeColor(node)
  const isItem = node.nodeType === 'item'

  return (
    <aside className="pointer-events-auto absolute top-20 right-4 z-30 flex max-h-[calc(100%-6rem)] w-[min(calc(100%-2rem),22rem)] flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface)/98 shadow-2xl backdrop-blur-xl max-md:right-1/2 max-md:translate-x-1/2">
      {/* Colored top line */}
      <div className="absolute inset-x-0 top-0 h-[2px] shrink-0" style={{ background: `linear-gradient(90deg, ${color}cc, ${color}11)` }} />

      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-5 pb-4 border-b border-(--border-subtle)">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[9px] font-semibold tracking-[0.12em] uppercase" style={{ color }}>
              {NODE_LABELS[node.type] || node.type}
            </span>
          </div>
          <h3 className="line-clamp-2 text-base font-bold leading-tight text-(--text-primary)">
            {formatLabel(node.name)}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 shrink-0 rounded-lg p-1.5 text-(--text-muted) transition hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Thumbnail */}
        {node.imageUrl && (
          <div className="overflow-hidden rounded-xl border border-(--border-subtle)">
            <img
              src={node.imageUrl}
              alt={formatLabel(node.name)}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-36 w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}

        {/* Summary */}
        {node.summary && (
          <p className="text-[13px] leading-relaxed text-(--text-secondary)">{node.summary}</p>
        )}

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {node.tags.slice(0, 12).map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ background: `${color}12`, color: `${color}cc` }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Open button */}
        {isItem && (
          <button
            onClick={() => onOpenItem(node.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}
          >
            Open Full Detail
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {/* Related nodes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold tracking-widest text-(--text-muted) uppercase">
              Connections
            </span>
            <span className="rounded-md bg-(--bg-elevated) px-2 py-0.5 text-[10px] font-bold text-(--text-secondary)">
              {relatedItemNodes.length}
            </span>
          </div>

          {relatedItemNodes.length > 0 ? (
            <div className="space-y-1.5">
              {relatedItemNodes.slice(0, 10).map((item) => {
                const c = nodeColor(item)
                return (
                  <button
                    key={item.id}
                    onClick={() => onOpenItem(item.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/40 px-3 py-2.5 text-left transition hover:border-(--accent)/30 hover:bg-(--bg-overlay)"
                  >
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c }} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[12px] font-medium text-(--text-primary)">
                        {formatLabel(item.name)}
                      </p>
                      <p className="text-[9px] tracking-wide text-(--text-muted) uppercase">{item.type}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-(--text-muted)" />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-(--border-subtle) p-4 text-center">
              <p className="text-[11px] text-(--text-muted)">No connected nodes</p>
            </div>
          )}
        </div>
      </div>

      {/* ESC hint */}
      <div className="shrink-0 border-t border-(--border-subtle) px-4 py-2.5 text-center">
        <p className="text-[9px] text-(--text-muted) tracking-widest uppercase">Press ESC to dismiss</p>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: GraphToolbar
// ─────────────────────────────────────────────────────────────────────────────

interface GraphToolbarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchMatchCount: number
  hasSearch: boolean
  isSyncing: boolean
  onSync: () => void
  viewMode: 'network' | 'hierarchy'
  setViewMode: (m: 'network' | 'hierarchy') => void
  onFitView: () => void
  onMaximize: () => void
  showWeakLinks: boolean
  setShowWeakLinks: (v: boolean) => void
  showTagNodes: boolean
  setShowTagNodes: (v: boolean) => void
}

function GraphToolbar({
  searchQuery, setSearchQuery, searchMatchCount, hasSearch,
  isSyncing, onSync, viewMode, setViewMode, onFitView, onMaximize,
  showWeakLinks, setShowWeakLinks, showTagNodes, setShowTagNodes,
}: GraphToolbarProps) {
  return (
    <div className="pointer-events-none absolute top-4 right-4 left-4 z-10 flex items-start justify-between gap-3 max-lg:flex-col">

      {/* Left: Title + Search */}
      <div className="pointer-events-auto w-full max-w-xs">
        <div className="rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-4 shadow-xl backdrop-blur-md">

          {/* Title row */}
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#4648d4] to-[#6063ee] shadow-md">
              <Orbit className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold leading-tight text-(--text-primary)">Knowledge Graph</p>
              <p className="text-[9px] font-semibold tracking-[0.12em] text-(--accent) uppercase">Memory Topology</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-(--text-muted)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes…"
              className="w-full rounded-xl border border-(--border-subtle) bg-(--bg-base) py-2 pr-8 pl-9 text-xs text-(--text-primary) placeholder-(--text-muted) outline-none transition focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary)"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {hasSearch && (
            <p className="mt-1.5 text-[10px] text-(--text-muted)">
              {searchMatchCount} match{searchMatchCount !== 1 ? 'es' : ''}
            </p>
          )}
          {!hasSearch && (
            <p className="mt-1.5 text-[10px] text-(--text-muted)">
              Hover to preview · click to pin
            </p>
          )}
        </div>
      </div>

      {/* Right: Tools */}
      <div className="pointer-events-auto flex flex-wrap items-start gap-2 max-lg:w-full max-lg:justify-start">

        {/* Sync */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          title="Sync graph"
          className="rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-2.5 text-(--text-primary) shadow-lg backdrop-blur transition hover:bg-(--accent) hover:text-white disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>

        {/* View mode + fit/fullscreen */}
        <div className="flex items-center gap-1 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-1.5 shadow-lg backdrop-blur">
          <button
            onClick={() => setViewMode('network')}
            title="Network view"
            className={`rounded-xl p-2 transition ${viewMode === 'network' ? 'bg-(--accent) text-white' : 'text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)'}`}
          >
            <Orbit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('hierarchy')}
            title="Hierarchy view"
            className={`rounded-xl p-2 transition ${viewMode === 'hierarchy' ? 'bg-(--accent) text-white' : 'text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)'}`}
          >
            <Network className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1 h-4 w-px bg-(--border-subtle)" />
          <button onClick={onFitView} title="Fit to view" className="rounded-xl p-2 text-(--text-secondary) transition hover:bg-(--bg-overlay) hover:text-(--text-primary)">
            <LocateFixed className="h-3.5 w-3.5" />
          </button>
          <button onClick={onMaximize} title="Fullscreen" className="rounded-xl p-2 text-(--text-secondary) transition hover:bg-(--bg-overlay) hover:text-(--text-primary)">
            <Maximize className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-1.5 shadow-lg backdrop-blur">
          <button
            onClick={() => setShowWeakLinks(!showWeakLinks)}
            title="Toggle weak links"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition ${showWeakLinks ? 'bg-(--accent) text-white' : 'text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)'}`}
          >
            <Link2 className="h-3 w-3" />
            Weak
          </button>
          <button
            onClick={() => setShowTagNodes(!showTagNodes)}
            title="Toggle tag nodes"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition ${showTagNodes ? 'bg-(--accent) text-white' : 'text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)'}`}
          >
            <Tag className="h-3 w-3" />
            Tags
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: GraphStats
// ─────────────────────────────────────────────────────────────────────────────

interface GraphStatsProps {
  itemNodes: number
  tagNodes: number
  links: number
  avgDegree: number
  density: number
}

function GraphStats({ itemNodes, tagNodes, links, avgDegree, density }: GraphStatsProps) {
  return (
    <div className="pointer-events-none absolute right-4 bottom-4 left-4 z-10 flex flex-wrap items-end justify-between gap-3">

      {/* Stat chips */}
      <div className="pointer-events-auto flex flex-wrap gap-2">
        {[
          { label: 'Items', value: String(itemNodes), icon: <Sparkles className="h-3 w-3 text-(--accent)" /> },
          { label: 'Tags', value: String(tagNodes), icon: <Tag className="h-3 w-3 text-[#a855f7]" /> },
          { label: 'Links', value: String(links), icon: <Link2 className="h-3 w-3 text-(--accent)" /> },
          { label: 'Avg Degree', value: avgDegree.toFixed(1), icon: <Activity className="h-3 w-3 text-[#22c55e]" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/90 px-3 py-2 shadow-lg backdrop-blur">
            {icon}
            <div className="leading-tight">
              <p className="text-[8px] font-semibold tracking-[0.12em] text-(--text-muted) uppercase">{label}</p>
              <p className="text-[11px] font-bold text-(--text-primary)">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="pointer-events-auto rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/90 px-4 py-3 shadow-lg backdrop-blur max-md:hidden">
        <p className="mb-2 text-[8px] font-semibold tracking-[0.12em] text-(--text-muted) uppercase">Legend</p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
          {[
            { color: '#ef4444', label: 'Video' },
            { color: '#3b82f6', label: 'Article' },
            { color: '#1da1f2', label: 'Tweet' },
            { color: '#f97316', label: 'PDF' },
            { color: '#a855f7', label: 'Tag', diamond: true },
          ].map(({ color, label, diamond }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`h-2 w-2 ${diamond ? 'rotate-45 rounded-[2px]' : 'rounded-full'}`}
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-(--text-secondary)">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="h-px w-3 bg-[#22c55e]" />
            <span className="text-[10px] text-(--text-secondary)">
              {(density * 100).toFixed(1)}% dense
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main: KnowledgeGraph
// ─────────────────────────────────────────────────────────────────────────────

export function KnowledgeGraph() {
  const fgRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { graphData, isLoading, syncGraph, isSyncing } = useGraph()

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [viewMode, setViewMode] = useState<'network' | 'hierarchy'>('network')
  const [showWeakLinks, setShowWeakLinks] = useState(false)
  const [showTagNodes, setShowTagNodes] = useState(true)

  // Hover / highlight state
  const [highlightNodes, setHighlightNodes] = useState(new Set<any>())
  const [highlightLinks, setHighlightLinks] = useState(new Set<any>())
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Pinned dialog state
  const [pinnedNode, setPinnedNode] = useState<GraphNode | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMatchIds, setSearchMatchIds] = useState<Set<string>>(new Set())

  // ── Resize observer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([e]) =>
      setDimensions({ width: e.contentRect.width, height: e.contentRect.height })
    )
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // ── Auto-fit on data load ───────────────────────────────────────────────────
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => fgRef.current?.zoomToFit(600, 60), 500)
    }
  }, [graphData])

  // ── ESC to close dialog ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPinnedNode(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Mouse tracking ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // ── Search logic ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchMatchIds(new Set()); return }
    const q = searchQuery.toLowerCase()
    const ids = new Set<string>()
    graphData.nodes.forEach((n: any) => {
      const name = (n.name || '').toLowerCase()
      const tags = (n.tags || []).join(' ').toLowerCase()
      if (name.includes(q) || tags.includes(q)) ids.add(n.id)
    })
    setSearchMatchIds(ids)
    if (ids.size > 0 && fgRef.current) {
      const matched = graphData.nodes.filter((n: any) => ids.has(n.id))
      if (matched.length === 1) {
        const nd = matched[0] as any
        fgRef.current.centerAt(nd.x, nd.y, 600)
        fgRef.current.zoom(3, 600)
      } else {
        fgRef.current.zoomToFit(600, 60)
      }
    }
  }, [searchQuery, graphData])

  const hasSearch = searchQuery.trim().length > 0

  // ── Filtered graph data ─────────────────────────────────────────────────────
  const filteredGraphData = useMemo(() => {
    let nodes = graphData.nodes as GraphNode[]
    let links = graphData.links as GraphLink[]

    if (!showTagNodes) {
      const tagIds = new Set(nodes.filter(n => n.nodeType === 'tag').map(n => n.id))
      nodes = nodes.filter(n => n.nodeType !== 'tag')
      links = links.filter(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source
        const t = typeof l.target === 'object' ? l.target.id : l.target
        return !tagIds.has(s) && !tagIds.has(t)
      })
    }

    if (!showWeakLinks) {
      links = links.filter(l => l.label !== 'weak')
    }

    return { nodes, links }
  }, [graphData, showTagNodes, showWeakLinks])

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const allNodes = filteredGraphData.nodes
    const itemNodes = allNodes.filter(n => n.nodeType !== 'tag').length
    const tagNodes = allNodes.filter(n => n.nodeType === 'tag').length
    const links = filteredGraphData.links.length
    const totalDeg = allNodes.reduce((acc: number, n: any) => {
      const deg = filteredGraphData.links.filter((l: any) => {
        const s = typeof l.source === 'object' ? l.source.id : l.source
        const t = typeof l.target === 'object' ? l.target.id : l.target
        return s === n.id || t === n.id
      }).length
      return acc + deg
    }, 0)
    const avgDegree = allNodes.length > 0 ? totalDeg / allNodes.length : 0
    const maxLinks = (allNodes.length * (allNodes.length - 1)) / 2
    const density = maxLinks > 0 ? links / maxLinks : 0
    return { itemNodes, tagNodes, links, avgDegree, density }
  }, [filteredGraphData])

  // ── Related nodes (for dialog) ──────────────────────────────────────────────
  const relatedItemNodes = useMemo(() => {
    if (!pinnedNode) return []
    const neighborIds = new Set<string>()
    graphData.links.forEach((l: any) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      if (s === pinnedNode.id) neighborIds.add(t)
      if (t === pinnedNode.id) neighborIds.add(s)
    })
    return graphData.nodes.filter(
      (n: any) => neighborIds.has(n.id) && n.nodeType !== 'tag'
    ) as GraphNode[]
  }, [pinnedNode, graphData])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((node: any) => {
    if (node.nodeType === 'tag') return
    if (pinnedNode?.id === node.id) {
      setPinnedNode(null)
    } else {
      setPinnedNode(node as GraphNode)
    }
  }, [pinnedNode])

  const handleNodeHover = useCallback((node: any) => {
    const hNodes = new Set<any>()
    const hLinks = new Set<any>()
    if (node) {
      hNodes.add(node)
      graphData.links.forEach((l: any) => {
        const s = typeof l.source === 'object' ? l.source.id : l.source
        const t = typeof l.target === 'object' ? l.target.id : l.target
        if (s === node.id || t === node.id) {
          hLinks.add(l)
          if (s === node.id && typeof l.target === 'object') hNodes.add(l.target)
          if (t === node.id && typeof l.source === 'object') hNodes.add(l.source)
        }
      })
    }
    setHoverNode(node ?? null)
    setHighlightNodes(hNodes)
    setHighlightLinks(hLinks)
  }, [graphData])

  const handleOpenItem = useCallback((id: string) => {
    navigate(`/items/${id}`)
  }, [navigate])

  // ── Canvas node draw ─────────────────────────────────────────────────────────
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHovered = node === hoverNode
    const isHighlighted = highlightNodes.has(node)
    const isSearchMatch = searchMatchIds.has(node.id)
    const isPinned = pinnedNode?.id === node.id
    const isTagNode = node.nodeType === 'tag'
    const isDimmed = (hoverNode && !isHighlighted) || (hasSearch && !isSearchMatch)

    const baseSize = (node.val || 2) * 1.2
    const size = isHovered || isPinned ? baseSize + 4 : isHighlighted ? baseSize + 2 : baseSize
    const color = node.color || NODE_COLORS[node.type] || NODE_COLORS.default

    // Glow ring
    if (isHovered || isPinned || (isSearchMatch && hasSearch)) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI)
      ctx.fillStyle = `${color}30`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(node.x, node.y, size + 10, 0, 2 * Math.PI)
      ctx.fillStyle = `${color}10`
      ctx.fill()
    }

    // Shape
    ctx.beginPath()
    if (isTagNode) {
      ctx.moveTo(node.x, node.y - size)
      ctx.lineTo(node.x + size, node.y)
      ctx.lineTo(node.x, node.y + size)
      ctx.lineTo(node.x - size, node.y)
      ctx.closePath()
    } else {
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    }

    ctx.fillStyle = isDimmed ? 'rgba(120,120,140,0.12)' : color
    ctx.fill()
    ctx.strokeStyle = isDimmed ? 'rgba(255,255,255,0.04)' : isPinned ? '#ffffff' : isHovered ? '#ffffffcc' : 'rgba(255,255,255,0.5)'
    ctx.lineWidth = (isPinned || isHovered ? 2.5 : 1.5) / globalScale
    ctx.stroke()

    // Label
    const label = formatLabel(node.name)
    const showLabel = isHovered || isPinned || (isHighlighted && globalScale > 1.2) || globalScale > 2.5 || (isSearchMatch && hasSearch)
    if (showLabel && !isDimmed) {
      const fontSize = (isHovered || isPinned ? 13 : 10) / globalScale
      ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const tw = ctx.measureText(label).width
      const pad = 4 / globalScale
      const pillY = node.y + size + 4 / globalScale
      const rx = tw / 2 + pad * 2
      const ry = fontSize / 2 + pad
      ctx.beginPath()
      ctx.roundRect(node.x - rx, pillY - pad, rx * 2, ry * 2, 4 / globalScale)
      ctx.fillStyle = (isHovered || isPinned) ? 'rgba(0,0,0,0.82)' : 'rgba(255,255,255,0.92)'
      ctx.fill()
      ctx.fillStyle = (isHovered || isPinned) ? '#fff' : '#1e293b'
      ctx.fillText(label, node.x, pillY)
    }

    // Type badge on hover/pin
    if ((isHovered || isPinned) && node.type) {
      const badgeY = node.y - size - 14 / globalScale
      const bfs = 8 / globalScale
      ctx.font = `bold ${bfs}px ui-sans-serif, system-ui, sans-serif`
      const bText = node.type.toUpperCase()
      const bw = ctx.measureText(bText).width
      const bp = 3 / globalScale
      ctx.beginPath()
      ctx.roundRect(node.x - bw / 2 - bp, badgeY - bp, bw + bp * 2, bfs + bp * 2, 3 / globalScale)
      ctx.fillStyle = color
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(bText, node.x, badgeY)
    }
  }, [hoverNode, highlightNodes, searchMatchIds, hasSearch, pinnedNode])

  // ── Link styling ─────────────────────────────────────────────────────────────
  const getLinkColor = useCallback((link: any) => {
    if (highlightLinks.has(link)) return '#6366f1'
    if (hoverNode) return 'rgba(200,200,200,0.03)'
    return LINK_COLORS[link.label] || 'rgba(70,72,212,0.1)'
  }, [highlightLinks, hoverNode])

  const getLinkWidth = useCallback((link: any) => {
    if (highlightLinks.has(link)) return 3
    if (link.label === 'strong') return 2
    if (link.label === 'medium') return 1.5
    if (link.label === 'tag') return 0.8
    return 0.5
  }, [highlightLinks])

  // ── Tooltip position relative to container ───────────────────────────────────
  const tooltipPosition = useMemo(() => {
    if (!containerRef.current) return { x: mousePos.x, y: mousePos.y }
    const rect = containerRef.current.getBoundingClientRect()
    return { x: mousePos.x - rect.left, y: mousePos.y - rect.top }
  }, [mousePos])

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-full min-h-[600px] w-full flex-col overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--bg-surface) shadow-xl">

      {/* Toolbar */}
      <GraphToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchMatchCount={searchMatchIds.size}
        hasSearch={hasSearch}
        isSyncing={isSyncing}
        onSync={() => syncGraph()}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onFitView={() => fgRef.current?.zoomToFit(400, 60)}
        onMaximize={() => {
          if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen?.()
          } else {
            document.exitFullscreen?.()
          }
        }}
        showWeakLinks={showWeakLinks}
        setShowWeakLinks={setShowWeakLinks}
        showTagNodes={showTagNodes}
        setShowTagNodes={setShowTagNodes}
      />

      {/* Hover tooltip (only when no pinned node) */}
      {hoverNode && !pinnedNode && (
        <GraphTooltip node={hoverNode} position={tooltipPosition} />
      )}

      {/* Pinned detail panel */}
      <GraphNodeDialog
        node={pinnedNode}
        relatedItemNodes={relatedItemNodes}
        onClose={() => setPinnedNode(null)}
        onOpenItem={handleOpenItem}
      />

      {/* Canvas */}
      {isLoading ? (
        <div className="flex min-h-[600px] flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--accent)" />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="min-h-[600px] w-full flex-1 bg-[#09090b]"
          style={{
            cursor: hoverNode
              ? hoverNode.nodeType === 'tag' ? 'default' : 'pointer'
              : 'default',
          }}
        >
          {dimensions.width > 0 && (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={Math.max(dimensions.height, 600)}
              graphData={filteredGraphData}
              dagMode={viewMode === 'hierarchy' ? 'td' : undefined}
              dagLevelDistance={viewMode === 'hierarchy' ? 60 : undefined}
              nodeCanvasObject={nodeCanvasObject}
              nodePointerAreaPaint={(node: any, color, ctx) => {
                ctx.fillStyle = color
                ctx.beginPath()
                ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI)
                ctx.fill()
              }}
              nodeRelSize={6}
              linkColor={getLinkColor}
              linkWidth={getLinkWidth}
              linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 3 : 0}
              linkDirectionalParticleWidth={2.5}
              linkDirectionalParticleColor={() => '#6366f1'}
              linkLineDash={(link: any) => link.label === 'tag' ? [2, 2] : null}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              d3VelocityDecay={0.3}
              cooldownTicks={100}
              enableNodeDrag
              minZoom={0.5}
              maxZoom={8}
            />
          )}
        </div>
      )}

      {/* Stats bar */}
      <GraphStats
        itemNodes={stats.itemNodes}
        tagNodes={stats.tagNodes}
        links={stats.links}
        avgDegree={stats.avgDegree}
        density={stats.density}
      />
    </div>
  )
}