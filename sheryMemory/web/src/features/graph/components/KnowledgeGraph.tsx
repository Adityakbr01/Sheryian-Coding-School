import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useGraph } from '../hooks/useGraph';
import { RefreshCw, Maximize, Link2, Orbit, Sparkles, Network, Search, X, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Color Palette ─────────────────────────────────────────────────
const NODE_COLORS: Record<string, string> = {
  video: '#ef4444',
  article: '#3b82f6',
  tweet: '#1da1f2',
  pdf: '#f97316',
  tag: '#a855f7',
  default: '#8b5cf6',
};

const LINK_COLORS: Record<string, string> = {
  strong: '#22c55e',
  medium: '#3b82f6',
  weak: 'rgba(100, 116, 139, 0.3)',
  tag: 'rgba(168, 85, 247, 0.25)',
};

export function KnowledgeGraph() {
  const fgRef = useRef<any>(null);
  const { graphData, isLoading, syncGraph, isSyncing } = useGraph();
  const navigate = useNavigate();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<'network' | 'hierarchy'>('network');
  const containerRef = useRef<HTMLDivElement>(null);

  // Highlighting State
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatchIds, setSearchMatchIds] = useState<Set<string>>(new Set());

  // Container resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      setDimensions({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-center graph on load
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => fgRef.current?.zoomToFit(600, 60), 500);
    }
  }, [graphData]);

  // Search filter logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatchIds(new Set());
      return;
    }
    const q = searchQuery.toLowerCase();
    const matchIds = new Set<string>();
    graphData.nodes.forEach((node: any) => {
      const name = (node.name || '').toLowerCase();
      const tags = (node.tags || []).join(' ').toLowerCase();
      if (name.includes(q) || tags.includes(q)) {
        matchIds.add(node.id);
      }
    });
    setSearchMatchIds(matchIds);

    // Auto-focus on matched nodes
    if (matchIds.size > 0 && fgRef.current) {
      const matchedNodes = graphData.nodes.filter((n: any) => matchIds.has(n.id));
      if (matchedNodes.length === 1) {
        const node = matchedNodes[0] as any;
        fgRef.current.centerAt(node.x, node.y, 600);
        fgRef.current.zoom(3, 600);
      } else {
        fgRef.current.zoomToFit(600, 60);
      }
    }
  }, [searchQuery, graphData]);

  const hasSearch = searchQuery.trim().length > 0;

  // ── Node click handler ──────────────────────────────────────────
  const handleNodeClick = useCallback((node: any) => {
    if (node.nodeType === 'tag') return; // Tags are not clickable
    navigate(`/items/${node.id}`);
  }, [navigate]);

  // ── Node hover handler ──────────────────────────────────────────
  const handleNodeHover = useCallback((node: any) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (node) {
      newHighlightNodes.add(node);
      graphData.links.forEach((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        if (sourceId === node.id || targetId === node.id) {
          newHighlightLinks.add(link);
          if (sourceId === node.id && typeof link.target === 'object') newHighlightNodes.add(link.target);
          if (targetId === node.id && typeof link.source === 'object') newHighlightNodes.add(link.source);
        }
      });
    }

    setHoverNode(node || null);
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, [graphData]);

  // ── Format label: strip metadata after `|` ──────────────────────
  const formatLabel = useCallback((name: string) => {
    if (!name) return '';
    return name.split('|')[0].trim();
  }, []);

  // ── Node canvas rendering ───────────────────────────────────────
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHovered = node === hoverNode;
    const isHighlighted = highlightNodes.has(node);
    const isSearchMatch = searchMatchIds.has(node.id);
    const isTagNode = node.nodeType === 'tag';
    const isDimmed = (hoverNode && !isHighlighted) || (hasSearch && !isSearchMatch);

    const baseSize = (node.val || 2) * 1.2;
    const size = isHovered ? baseSize + 4 : (isHighlighted ? baseSize + 2 : baseSize);
    const baseColor = node.color || NODE_COLORS[node.type] || NODE_COLORS.default;

    // ── Outer glow ring (hovered or search match) ─────────────
    if (isHovered || (isSearchMatch && hasSearch)) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI, false);
      ctx.fillStyle = isHovered
        ? `${baseColor}33`
        : `${baseColor}22`;
      ctx.fill();

      // Second glow layer
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 10, 0, 2 * Math.PI, false);
      ctx.fillStyle = `${baseColor}11`;
      ctx.fill();
    }

    // ── Main node shape ───────────────────────────────────────
    ctx.beginPath();
    if (isTagNode) {
      // Diamond shape for tag nodes
      ctx.moveTo(node.x, node.y - size);
      ctx.lineTo(node.x + size, node.y);
      ctx.lineTo(node.x, node.y + size);
      ctx.lineTo(node.x - size, node.y);
      ctx.closePath();
    } else {
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    }

    ctx.fillStyle = isDimmed ? 'rgba(120,120,140,0.15)' : baseColor;
    ctx.fill();

    // ── Stroke border ─────────────────────────────────────────
    ctx.strokeStyle = isDimmed
      ? 'rgba(255,255,255,0.05)'
      : isHovered
        ? '#ffffff'
        : 'rgba(255,255,255,0.6)';
    ctx.lineWidth = (isHovered ? 2.5 : 1.5) / globalScale;
    ctx.stroke();

    // ── Label rendering ───────────────────────────────────────
    const label = formatLabel(node.name);
    const shouldShowLabel = isHovered || (isHighlighted && globalScale > 1.2) || globalScale > 2.5 || (isSearchMatch && hasSearch);

    if (shouldShowLabel && !isDimmed) {
      const fontSize = isHovered ? 13 / globalScale : 10 / globalScale;
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const textWidth = ctx.measureText(label).width;
      const padding = 4 / globalScale;
      const pillY = node.y + size + 4 / globalScale;

      // Pill background
      const rx = textWidth / 2 + padding * 2;
      const ry = fontSize / 2 + padding;
      const cornerRadius = 4 / globalScale;

      ctx.beginPath();
      ctx.roundRect(node.x - rx, pillY - padding, rx * 2, ry * 2, cornerRadius);
      ctx.fillStyle = isHovered ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.92)';
      ctx.fill();

      ctx.fillStyle = isHovered ? '#ffffff' : '#1e293b';
      ctx.fillText(label, node.x, pillY);
    }

    // ── Type badge on hover ──────────────────────────────────
    if (isHovered && node.type) {
      const badgeY = node.y - size - 14 / globalScale;
      const badgeFontSize = 8 / globalScale;
      ctx.font = `bold ${badgeFontSize}px Inter, system-ui, sans-serif`;
      const badgeText = node.type.toUpperCase();
      const badgeWidth = ctx.measureText(badgeText).width;
      const bp = 3 / globalScale;
      const br = 3 / globalScale;

      ctx.beginPath();
      ctx.roundRect(node.x - badgeWidth / 2 - bp, badgeY - bp, badgeWidth + bp * 2, badgeFontSize + bp * 2, br);
      ctx.fillStyle = baseColor;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(badgeText, node.x, badgeY);
    }
  }, [hoverNode, highlightNodes, searchMatchIds, hasSearch, formatLabel]);

  // ── Link color with glow support ────────────────────────────────
  const getLinkColor = useCallback((link: any) => {
    if (highlightLinks.has(link)) return '#6366f1';
    if (hoverNode) return 'rgba(200,200,200,0.04)';
    return LINK_COLORS[link.label] || 'rgba(70, 72, 212, 0.12)';
  }, [highlightLinks, hoverNode]);

  const getLinkWidth = useCallback((link: any) => {
    if (highlightLinks.has(link)) return 3;
    if (link.label === 'strong') return 2;
    if (link.label === 'medium') return 1.5;
    if (link.label === 'tag') return 0.8;
    return 0.5;
  }, [highlightLinks]);

  // ── Memoized stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const itemNodes = graphData.nodes.filter((n: any) => n.nodeType !== 'tag').length;
    const tagNodes = graphData.nodes.filter((n: any) => n.nodeType === 'tag').length;
    return { itemNodes, tagNodes, links: graphData.links.length };
  }, [graphData]);

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-xl shadow-[var(--border-subtle)]/30 relative">

      {/* ── Graph Toolbar Overlay ─────────────────────────────── */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">

        {/* Left Side: Title & Search */}
        <div className="flex flex-col gap-3 pointer-events-auto max-w-sm w-full">
          <div className="bg-[var(--bg-elevated)]/90 backdrop-blur-md p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center shadow-lg">
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-manrope font-extrabold text-[var(--text-primary)] leading-tight">Knowledge Graph</h3>
                <p className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-bold">Neural Network View</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes..."
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-8 py-2 text-xs focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasSearch && (
              <p className="text-[10px] text-[var(--text-secondary)] mt-2">
                {searchMatchIds.size} node{searchMatchIds.size !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Tools */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <button
            onClick={() => syncGraph()}
            disabled={isSyncing}
            className="bg-[var(--bg-elevated)]/90 backdrop-blur hover:bg-[var(--accent)] hover:text-white text-[var(--text-primary)] border border-[var(--border-subtle)] p-3 rounded-2xl shadow-lg transition-all group disabled:opacity-50"
            title="Run Vector Correlation Sync"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <div className="bg-[var(--bg-elevated)]/90 backdrop-blur border border-[var(--border-subtle)] p-1.5 rounded-2xl shadow-lg flex flex-col gap-1">
            <button onClick={() => setViewMode('network')} title="Network View" className={`p-2 rounded-xl transition-all ${viewMode === 'network' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}>
              <Orbit className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('hierarchy')} title="Hierarchy View" className={`p-2 rounded-xl transition-all ${viewMode === 'hierarchy' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}>
              <Network className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-[var(--border-subtle)] my-1 mx-2" />
            <button title="Recenter" onClick={() => fgRef.current?.zoomToFit(400, 60)} className="p-2 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-xl transition-all">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Hover Tooltip Panel ────────────────────────────────── */}
      {hoverNode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border-subtle)] shadow-2xl rounded-2xl p-4 max-w-xs w-72 pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: hoverNode.color || NODE_COLORS[hoverNode.type] || NODE_COLORS.default }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {hoverNode.type}
            </span>
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug">
            {formatLabel(hoverNode.name)}
          </h4>
          {hoverNode.summary && (
            <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
              {hoverNode.summary}
            </p>
          )}
          {hoverNode.tags && hoverNode.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {hoverNode.tags.slice(0, 5).map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-semibold rounded-full border border-[var(--accent)]/20">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {hoverNode.nodeType === 'item' && (
            <p className="text-[10px] text-[var(--text-muted)] mt-3 italic">Click to view details →</p>
          )}
        </div>
      )}

      {/* ── Canvas Container ───────────────────────────────────── */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[600px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 w-full bg-[#fafafa] dark:bg-[#09090b] min-h-[600px]"
          style={{ cursor: hoverNode ? (hoverNode.nodeType === 'tag' ? 'default' : 'pointer') : 'default' }}
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
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI, false);
                ctx.fill();
              }}
              nodeRelSize={6}
              linkColor={getLinkColor}
              linkWidth={getLinkWidth}
              linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 3 : 0}
              linkDirectionalParticleWidth={2.5}
              linkDirectionalParticleColor={() => '#6366f1'}
              linkLineDash={(link: any) => link.label === 'tag' ? [2, 2] : undefined}
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
      <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <div className="bg-[var(--bg-elevated)]/90 backdrop-blur border border-[var(--border-subtle)] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--text-primary)]">{stats.itemNodes} Items</span>
          </div>
          <div className="bg-[var(--bg-elevated)]/90 backdrop-blur border border-[var(--border-subtle)] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-bold text-[var(--text-primary)]">{stats.tagNodes} Tags</span>
          </div>
          <div className="bg-[var(--bg-elevated)]/90 backdrop-blur border border-[var(--border-subtle)] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--text-primary)]">{stats.links} Links</span>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[var(--bg-elevated)]/90 backdrop-blur border border-[var(--border-subtle)] px-4 py-3 rounded-xl shadow-lg pointer-events-auto">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Legend</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-[10px] text-[var(--text-secondary)]">Video</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
              <span className="text-[10px] text-[var(--text-secondary)]">Article</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm rotate-45" style={{ backgroundColor: '#a855f7' }} />
              <span className="text-[10px] text-[var(--text-secondary)]">Tag</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
