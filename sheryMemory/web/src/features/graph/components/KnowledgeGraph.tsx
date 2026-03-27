import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useGraph } from '../hooks/useGraph'
import {
  RefreshCw,
  Maximize,
  Link2,
  Orbit,
  Sparkles,
  Network,
  Search,
  X,
  Tag,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ── Color Palette ─────────────────────────────────────────────────
const NODE_COLORS: Record<string, string> = {
  video: '#ef4444',
  article: '#3b82f6',
  tweet: '#1da1f2',
  pdf: '#f97316',
  tag: '#a855f7',
  default: '#8b5cf6',
}

const LINK_COLORS: Record<string, string> = {
  strong: '#22c55e',
  medium: '#3b82f6',
  weak: 'rgba(100, 116, 139, 0.3)',
  tag: 'rgba(168, 85, 247, 0.25)',
}

export function KnowledgeGraph() {
  const fgRef = useRef<any>(null)
  const { graphData, isLoading, syncGraph, isSyncing } = useGraph()
  const navigate = useNavigate()

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [viewMode, setViewMode] = useState<'network' | 'hierarchy'>('network')
  const containerRef = useRef<HTMLDivElement>(null)

  // Highlighting State
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [highlightLinks, setHighlightLinks] = useState(new Set())
  const [hoverNode, setHoverNode] = useState<any>(null)

  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMatchIds, setSearchMatchIds] = useState<Set<string>>(new Set())

  // Container resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      setDimensions({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Auto-center graph on load
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => fgRef.current?.zoomToFit(600, 60), 500)
    }
  }, [graphData])

  // Search filter logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatchIds(new Set())
      return
    }
    const q = searchQuery.toLowerCase()
    const matchIds = new Set<string>()
    graphData.nodes.forEach((node: any) => {
      const name = (node.name || '').toLowerCase()
      const tags = (node.tags || []).join(' ').toLowerCase()
      if (name.includes(q) || tags.includes(q)) {
        matchIds.add(node.id)
      }
    })
    setSearchMatchIds(matchIds)

    // Auto-focus on matched nodes
    if (matchIds.size > 0 && fgRef.current) {
      const matchedNodes = graphData.nodes.filter((n: any) =>
        matchIds.has(n.id),
      )
      if (matchedNodes.length === 1) {
        const node = matchedNodes[0] as any
        fgRef.current.centerAt(node.x, node.y, 600)
        fgRef.current.zoom(3, 600)
      } else {
        fgRef.current.zoomToFit(600, 60)
      }
    }
  }, [searchQuery, graphData])

  const hasSearch = searchQuery.trim().length > 0

  // ── Node click handler ──────────────────────────────────────────
  const handleNodeClick = useCallback(
    (node: any) => {
      if (node.nodeType === 'tag') return // Tags are not clickable
      navigate(`/items/${node.id}`)
    },
    [navigate],
  )

  // ── Node hover handler ──────────────────────────────────────────
  const handleNodeHover = useCallback(
    (node: any) => {
      const newHighlightNodes = new Set()
      const newHighlightLinks = new Set()

      if (node) {
        newHighlightNodes.add(node)
        graphData.links.forEach((link: any) => {
          const sourceId =
            typeof link.source === 'object' ? link.source.id : link.source
          const targetId =
            typeof link.target === 'object' ? link.target.id : link.target
          if (sourceId === node.id || targetId === node.id) {
            newHighlightLinks.add(link)
            if (sourceId === node.id && typeof link.target === 'object')
              newHighlightNodes.add(link.target)
            if (targetId === node.id && typeof link.source === 'object')
              newHighlightNodes.add(link.source)
          }
        })
      }

      setHoverNode(node || null)
      setHighlightNodes(newHighlightNodes)
      setHighlightLinks(newHighlightLinks)
    },
    [graphData],
  )

  // ── Format label: strip metadata after `|` ──────────────────────
  const formatLabel = useCallback((name: string) => {
    if (!name) return ''
    return name.split('|')[0].trim()
  }, [])

  // ── Node canvas rendering ───────────────────────────────────────
  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHovered = node === hoverNode
      const isHighlighted = highlightNodes.has(node)
      const isSearchMatch = searchMatchIds.has(node.id)
      const isTagNode = node.nodeType === 'tag'
      const isDimmed =
        (hoverNode && !isHighlighted) || (hasSearch && !isSearchMatch)

      const baseSize = (node.val || 2) * 1.2
      const size = isHovered
        ? baseSize + 4
        : isHighlighted
          ? baseSize + 2
          : baseSize
      const baseColor =
        node.color || NODE_COLORS[node.type] || NODE_COLORS.default

      // ── Outer glow ring (hovered or search match) ─────────────
      if (isHovered || (isSearchMatch && hasSearch)) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI, false)
        ctx.fillStyle = isHovered ? `${baseColor}33` : `${baseColor}22`
        ctx.fill()

        // Second glow layer
        ctx.beginPath()
        ctx.arc(node.x, node.y, size + 10, 0, 2 * Math.PI, false)
        ctx.fillStyle = `${baseColor}11`
        ctx.fill()
      }

      // ── Main node shape ───────────────────────────────────────
      ctx.beginPath()
      if (isTagNode) {
        // Diamond shape for tag nodes
        ctx.moveTo(node.x, node.y - size)
        ctx.lineTo(node.x + size, node.y)
        ctx.lineTo(node.x, node.y + size)
        ctx.lineTo(node.x - size, node.y)
        ctx.closePath()
      } else {
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
      }

      ctx.fillStyle = isDimmed ? 'rgba(120,120,140,0.15)' : baseColor
      ctx.fill()

      // ── Stroke border ─────────────────────────────────────────
      ctx.strokeStyle = isDimmed
        ? 'rgba(255,255,255,0.05)'
        : isHovered
          ? '#ffffff'
          : 'rgba(255,255,255,0.6)'
      ctx.lineWidth = (isHovered ? 2.5 : 1.5) / globalScale
      ctx.stroke()

      // ── Label rendering ───────────────────────────────────────
      const label = formatLabel(node.name)
      const shouldShowLabel =
        isHovered ||
        (isHighlighted && globalScale > 1.2) ||
        globalScale > 2.5 ||
        (isSearchMatch && hasSearch)

      if (shouldShowLabel && !isDimmed) {
        const fontSize = isHovered ? 13 / globalScale : 10 / globalScale
        ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        const textWidth = ctx.measureText(label).width
        const padding = 4 / globalScale
        const pillY = node.y + size + 4 / globalScale

        // Pill background
        const rx = textWidth / 2 + padding * 2
        const ry = fontSize / 2 + padding
        const cornerRadius = 4 / globalScale

        ctx.beginPath()
        ctx.roundRect(
          node.x - rx,
          pillY - padding,
          rx * 2,
          ry * 2,
          cornerRadius,
        )
        ctx.fillStyle = isHovered ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.92)'
        ctx.fill()

        ctx.fillStyle = isHovered ? '#ffffff' : '#1e293b'
        ctx.fillText(label, node.x, pillY)
      }

      // ── Type badge on hover ──────────────────────────────────
      if (isHovered && node.type) {
        const badgeY = node.y - size - 14 / globalScale
        const badgeFontSize = 8 / globalScale
        ctx.font = `bold ${badgeFontSize}px Inter, system-ui, sans-serif`
        const badgeText = node.type.toUpperCase()
        const badgeWidth = ctx.measureText(badgeText).width
        const bp = 3 / globalScale
        const br = 3 / globalScale

        ctx.beginPath()
        ctx.roundRect(
          node.x - badgeWidth / 2 - bp,
          badgeY - bp,
          badgeWidth + bp * 2,
          badgeFontSize + bp * 2,
          br,
        )
        ctx.fillStyle = baseColor
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(badgeText, node.x, badgeY)
      }
    },
    [hoverNode, highlightNodes, searchMatchIds, hasSearch, formatLabel],
  )

  // ── Link color with glow support ────────────────────────────────
  const getLinkColor = useCallback(
    (link: any) => {
      if (highlightLinks.has(link)) return '#6366f1'
      if (hoverNode) return 'rgba(200,200,200,0.04)'
      return LINK_COLORS[link.label] || 'rgba(70, 72, 212, 0.12)'
    },
    [highlightLinks, hoverNode],
  )

  const getLinkWidth = useCallback(
    (link: any) => {
      if (highlightLinks.has(link)) return 3
      if (link.label === 'strong') return 2
      if (link.label === 'medium') return 1.5
      if (link.label === 'tag') return 0.8
      return 0.5
    },
    [highlightLinks],
  )

  // ── Memoized stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const itemNodes = graphData.nodes.filter(
      (n: any) => n.nodeType !== 'tag',
    ).length
    const tagNodes = graphData.nodes.filter(
      (n: any) => n.nodeType === 'tag',
    ).length
    return { itemNodes, tagNodes, links: graphData.links.length }
  }, [graphData])

  return (
    <div className="relative flex h-full min-h-[600px] w-full flex-col overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--bg-surface) shadow-(--border-subtle)/30 shadow-xl">
      {/* ── Graph Toolbar Overlay ─────────────────────────────── */}
      <div className="pointer-events-none absolute top-6 right-6 left-6 z-10 flex items-start justify-between">
        {/* Left Side: Title & Search */}
        <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-3">
          <div className="rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-4 shadow-xl backdrop-blur-md">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] shadow-lg">
                <Orbit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-manrope leading-tight font-extrabold text-(--text-primary)">
                  Knowledge Graph
                </h3>
                <p className="text-[10px] font-bold tracking-widest text-(--accent) uppercase">
                  Neural Network View
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-(--text-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes..."
                className="w-full rounded-xl border border-(--border-subtle) bg-(--bg-base) py-2 pr-8 pl-9 text-xs text-(--text-primary) placeholder-(--text-muted) transition-all outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-(--text-muted) transition-colors hover:text-(--text-primary)"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {hasSearch && (
              <p className="mt-2 text-[10px] text-(--text-secondary)">
                {searchMatchIds.size} node{searchMatchIds.size !== 1 ? 's' : ''}{' '}
                found
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Tools */}
        <div className="pointer-events-auto flex flex-col gap-3">
          <button
            onClick={() => syncGraph()}
            disabled={isSyncing}
            className="group rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-3 text-(--text-primary) shadow-lg backdrop-blur transition-all hover:bg-(--accent) hover:text-white disabled:opacity-50"
            title="Run Vector Correlation Sync"
          >
            <RefreshCw
              className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`}
            />
          </button>

          <div className="flex flex-col gap-1 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-1.5 shadow-lg backdrop-blur">
            <button
              onClick={() => setViewMode('network')}
              title="Network View"
              className={`rounded-xl p-2 transition-all ${viewMode === 'network' ? 'bg-(--accent) text-white' : 'text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)'}`}
            >
              <Orbit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              title="Hierarchy View"
              className={`rounded-xl p-2 transition-all ${viewMode === 'hierarchy' ? 'bg-(--accent) text-white' : 'text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)'}`}
            >
              <Network className="h-4 w-4" />
            </button>
            <div className="mx-2 my-1 h-[1px] bg-(--border-subtle)" />
            <button
              title="Recenter"
              onClick={() => fgRef.current?.zoomToFit(400, 60)}
              className="rounded-xl p-2 text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Hover Tooltip Panel ────────────────────────────────── */}
      {hoverNode && (
        <div className="pointer-events-none absolute top-6 left-1/2 z-20 w-72 max-w-xs -translate-x-1/2 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2">
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  hoverNode.color ||
                  NODE_COLORS[hoverNode.type] ||
                  NODE_COLORS.default,
              }}
            />
            <span className="text-[10px] font-bold tracking-wider text-(--text-muted) uppercase">
              {hoverNode.type}
            </span>
          </div>
          <h4 className="line-clamp-2 text-sm leading-snug font-bold text-(--text-primary)">
            {formatLabel(hoverNode.name)}
          </h4>
          {hoverNode.summary && (
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-(--text-secondary)">
              {hoverNode.summary}
            </p>
          )}
          {hoverNode.tags && hoverNode.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {hoverNode.tags.slice(0, 5).map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-(--accent)/20 bg-(--accent)/10 px-2 py-0.5 text-[10px] font-semibold text-(--accent)"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {hoverNode.nodeType === 'item' && (
            <p className="mt-3 text-[10px] text-(--text-muted) italic">
              Click to view details →
            </p>
          )}
        </div>
      )}

      {/* ── Canvas Container ───────────────────────────────────── */}
      {isLoading ? (
        <div className="flex min-h-[600px] flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--accent)"></div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="min-h-[600px] w-full flex-1 bg-[#fafafa] dark:bg-[#09090b]"
          style={{
            cursor: hoverNode
              ? hoverNode.nodeType === 'tag'
                ? 'default'
                : 'pointer'
              : 'default',
          }}
        >
          {dimensions.width > 0 && (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={Math.max(dimensions.height, 600)}
              graphData={graphData}
              dagMode={viewMode === 'hierarchy' ? 'td' : undefined}
              dagLevelDistance={viewMode === 'hierarchy' ? 60 : undefined}
              nodeCanvasObject={nodeCanvasObject}
              nodePointerAreaPaint={(node: any, color, ctx) => {
                ctx.fillStyle = color
                ctx.beginPath()
                ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI, false)
                ctx.fill()
              }}
              nodeRelSize={6}
              linkColor={getLinkColor}
              linkWidth={getLinkWidth}
              linkDirectionalParticles={(link: any) =>
                highlightLinks.has(link) ? 3 : 0
              }
              linkDirectionalParticleWidth={2.5}
              linkDirectionalParticleColor={() => '#6366f1'}
              linkLineDash={(link: any) =>
                link.label === 'tag' ? [2, 2] : undefined
              }
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              d3VelocityDecay={0.3}
              cooldownTicks={100}
              enableNodeDrag={true}
              minZoom={0.5}
              maxZoom={8}
            />
          )}
        </div>
      )}

      {/* ── Bottom Stats Overlay ───────────────────────────────── */}
      <div className="pointer-events-none absolute right-6 bottom-6 left-6 z-10 flex items-end justify-between">
        <div className="pointer-events-auto flex gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/90 px-4 py-2 shadow-lg backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-(--accent)" />
            <span className="text-xs font-bold text-(--text-primary)">
              {stats.itemNodes} Items
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/90 px-4 py-2 shadow-lg backdrop-blur">
            <Tag className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-xs font-bold text-(--text-primary)">
              {stats.tagNodes} Tags
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/90 px-4 py-2 shadow-lg backdrop-blur">
            <Link2 className="h-3.5 w-3.5 text-(--accent)" />
            <span className="text-xs font-bold text-(--text-primary)">
              {stats.links} Links
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="pointer-events-auto rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/90 px-4 py-3 shadow-lg backdrop-blur">
          <p className="mb-2 text-[9px] font-bold tracking-widest text-(--text-muted) uppercase">
            Legend
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: '#ef4444' }}
              />
              <span className="text-[10px] text-(--text-secondary)">Video</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: '#3b82f6' }}
              />
              <span className="text-[10px] text-(--text-secondary)">
                Article
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rotate-45 rounded-sm"
                style={{ backgroundColor: '#a855f7' }}
              />
              <span className="text-[10px] text-(--text-secondary)">Tag</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
