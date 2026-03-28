import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Highlighter, X, Download, Trash2, XCircle } from 'lucide-react'
import {
  useTextSelection,
  useHighlights,
  HIGHLIGHT_COLORS,
  type Highlight,
} from '../hooks/useHighlight'

interface HighlightableContentProps {
  content: string
  itemId: string
  section?: string
  className?: string
}

// ── renderHighlightedText (PURE FUNCTION) ──────────────────────────
// Takes the ORIGINAL content string and a sorted array of highlights,
// splits content into segments using slice(), wraps highlighted parts
// with <span>, and returns React elements.
// RULES:
//   - NEVER uses innerHTML or DOM mutation
//   - ALWAYS slices from the original content string
//   - Handles overlapping highlights by clamping ranges
//   - Validates ranges before rendering
function renderHighlightedText(
  content: string,
  highlights: Highlight[],
  onClickHighlight: (e: React.MouseEvent, id: string) => void,
): React.ReactNode[] {
  if (!content) return []
  if (highlights.length === 0) return [content]

  // Sort by start offset, then by end offset (shorter first)
  const sorted = [...highlights]
    .filter(
      (hl) => hl.start >= 0 && hl.end > hl.start && hl.start < content.length,
    )
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const parts: React.ReactNode[] = []
  let cursor = 0

  for (const hl of sorted) {
    // Clamp to content boundaries
    const start = Math.max(hl.start, cursor) // skip if overlapping
    const end = Math.min(hl.end, content.length)

    if (start >= end) continue // Skip invalid or fully overlapping

    // Add plain text before this highlight
    if (start > cursor) {
      parts.push(
        <span key={`plain-${cursor}`}>{content.slice(cursor, start)}</span>,
      )
    }

    // Add the highlighted segment — ALWAYS from content.slice(), never from hl.text
    parts.push(
      <span
        key={`hl-${hl.id}`}
        onClick={(e) => onClickHighlight(e, hl.id)}
        className="relative cursor-pointer rounded-sm transition-all duration-200 hover:brightness-90"
        style={{
          backgroundColor: hl.color,
          boxShadow: `0 0 0 1px ${hl.color}`,
          padding: '1px 2px',
        }}
        title="Click to edit highlight"
      >
        {content.slice(start, end)}
      </span>,
    )

    cursor = end
  }

  // Add remaining plain text
  if (cursor < content.length) {
    parts.push(<span key={`plain-${cursor}`}>{content.slice(cursor)}</span>)
  }

  return parts
}

// ── Main Component ────────────────────────────────────────────────
export function HighlightableContent({
  content,
  itemId,
  section = 'content',
  className = '',
}: HighlightableContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { selection, clearSelection } = useTextSelection(containerRef)
  const {
    highlights,
    lastColor,
    setLastColor,
    addHighlight,
    removeHighlight,
    clearAllHighlights,
    exportHighlights,
  } = useHighlights(itemId, section)

  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(
    null,
  )
  const [showToolbar, setShowToolbar] = useState(false)
  const recolorPickerRef = useRef<HTMLInputElement>(null)
  const newPickerRef = useRef<HTMLInputElement>(null)

  // Stash refs for native event handlers
  const selectionRef = useRef(selection)
  const activeHlRef = useRef(activeHighlight)
  selectionRef.current = selection
  activeHlRef.current = activeHighlight

  // ── Native change listener for recolor picker ──────────────
  useEffect(() => {
    const el = recolorPickerRef.current
    if (!el) return
    const handler = async (e: Event) => {
      const color = (e.target as HTMLInputElement).value
      const hlId = activeHlRef.current
      if (!hlId) return
      const hl = highlights.find((h) => h.id === hlId)
      if (hl) {
        await removeHighlight(hlId)
        await addHighlight(hl.text, hl.start, hl.end, color)
      }
      setActiveHighlight(null)
      setShowToolbar(false)
    }
    el.addEventListener('change', handler)
    return () => el.removeEventListener('change', handler)
  }, [highlights, removeHighlight, addHighlight])

  // ── Native change listener for new highlight picker ────────
  useEffect(() => {
    const el = newPickerRef.current
    if (!el) return
    const handler = async (e: Event) => {
      const color = (e.target as HTMLInputElement).value
      const sel = selectionRef.current
      if (!sel) return
      await addHighlight(sel.text, sel.start, sel.end, color)
      setLastColor(color)
      clearSelection()
      setShowToolbar(false)
    }
    el.addEventListener('change', handler)
    return () => el.removeEventListener('change', handler)
  }, [addHighlight, setLastColor, clearSelection])

  // ── Position floating toolbar near selection ───────────────
  useEffect(() => {
    if (selection && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      setToolbarPos({
        x: selection.rect.left + selection.rect.width / 2 - containerRect.left,
        y: selection.rect.top - containerRect.top - 56,
      })
      setShowToolbar(true)
    } else if (!activeHighlight) {
      setShowToolbar(false)
    }
  }, [selection, activeHighlight])

  // ── Keyboard shortcut: H to highlight with last color ──────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        if (selection) {
          handleApplyHighlight(lastColor)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selection, lastColor])

  // ── Apply highlight ────────────────────────────────────────
  const handleApplyHighlight = useCallback(
    async (color: string) => {
      if (!selection) return
      await addHighlight(selection.text, selection.start, selection.end, color)
      setLastColor(color)
      clearSelection()
      setShowToolbar(false)
    },
    [selection, addHighlight, setLastColor, clearSelection],
  )

  // ── Click on existing highlight ────────────────────────────
  const handleHighlightClick = useCallback(
    (e: React.MouseEvent, hlId: string) => {
      e.stopPropagation()
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (containerRect) {
        setToolbarPos({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top - containerRect.top - 56,
        })
      }
      setActiveHighlight(hlId)
      setShowToolbar(true)
    },
    [],
  )

  // ── Close toolbar on outside click ─────────────────────────
  useEffect(() => {
    const handleClick = () => {
      if (activeHighlight && !selection) {
        setActiveHighlight(null)
        setShowToolbar(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [activeHighlight, selection])

  // ── Memoized highlighted content ───────────────────────────
  const renderedContent = useMemo(
    () => renderHighlightedText(content, highlights, handleHighlightClick),
    [content, highlights, handleHighlightClick],
  )

  return (
    <div className={`relative ${className}`}>
      {/* Highlightable Content Zone — no DOM mutation, pure React state */}
      <div ref={containerRef} className="whitespace-pre-wrap select-text">
        {renderedContent}
      </div>

      {/* ── Floating Toolbar ─────────────────────────────────── */}
      {showToolbar && toolbarPos && (
        <div
          className="animate-in fade-in slide-in-from-bottom-2 absolute z-50 duration-200"
          style={{
            left: `${toolbarPos.x}px`,
            top: `${toolbarPos.y}px`,
            transform: 'translateX(-50%)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) px-2 py-1.5 shadow-2xl shadow-black/20">
            {/* Active Highlight: Show remove + recolor */}
            {activeHighlight ? (
              <>
                <button
                  onClick={async () => {
                    await removeHighlight(activeHighlight)
                    setActiveHighlight(null)
                    setShowToolbar(false)
                  }}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
                <div className="h-5 w-px bg-(--border-subtle)" />
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={async () => {
                      const hl = highlights.find(
                        (h) => h.id === activeHighlight,
                      )
                      if (hl) {
                        await removeHighlight(activeHighlight)
                        await addHighlight(hl.text, hl.start, hl.end, c.value)
                      }
                      setActiveHighlight(null)
                      setShowToolbar(false)
                    }}
                    className="h-6 w-6 rounded-full border-2 border-transparent transition-all hover:scale-110 hover:border-(--text-primary) active:scale-95"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
                <label
                  className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-(--border-subtle) transition-all hover:scale-110 hover:border-(--text-primary)"
                  title="Custom color"
                >
                  <span className="text-[8px] font-bold text-(--text-muted)">
                    +
                  </span>
                  <input
                    ref={recolorPickerRef}
                    type="color"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
              </>
            ) : (
              <>
                {/* New Highlight: Show color picker */}
                <div className="flex items-center gap-0.5 px-1">
                  <Highlighter className="mr-1 h-3.5 w-3.5 text-(--text-muted)" />
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleApplyHighlight(c.value)}
                      className={`h-6 w-6 rounded-full transition-all hover:scale-125 active:scale-95 ${lastColor === c.value ? 'ring-2 ring-(--text-primary) ring-offset-1 ring-offset-(--bg-elevated)' : 'border-2 border-transparent hover:border-(--border-subtle)'}`}
                      style={{ backgroundColor: c.value }}
                      title={`${c.name}${lastColor === c.value ? ' (last used)' : ''}`}
                    />
                  ))}
                  <label
                    className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-(--border-subtle) transition-all hover:scale-110 hover:border-(--text-primary)"
                    title="Pick custom color"
                  >
                    <span className="text-[8px] font-bold text-(--text-muted)">
                      +
                    </span>
                    <input
                      ref={newPickerRef}
                      type="color"
                      defaultValue={lastColor}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </label>
                </div>
                <div className="h-5 w-px bg-(--border-subtle)" />
                <button
                  onClick={() => {
                    clearSelection()
                    setShowToolbar(false)
                  }}
                  className="rounded-lg p-1.5 text-(--text-muted) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Tooltip arrow */}
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-(--border-subtle) bg-(--bg-elevated)" />
        </div>
      )}

      {/* ── Highlights Footer Bar ────────────────────────────── */}
      {highlights.length > 0 && (
        <div className="mt-8 flex items-center justify-between rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/40 px-5 py-3 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 font-HelveticaNow">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--accent)/10">
              <Highlighter className="h-3.5 w-3.5 text-(--accent)" />
            </div>
            <span className="text-sm font-bold text-(--text-primary)">
              {highlights.length} highlight{highlights.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportHighlights}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              onClick={clearAllHighlights}
              className="group flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500/15"
            >
              <XCircle className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
               Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
