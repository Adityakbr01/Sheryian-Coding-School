import { useRef, useEffect, useState, useCallback } from 'react'
import { Highlighter, X, Download, Trash2, XCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Mark from 'mark.js'
import {
  useTextSelection,
  useHighlights,
  HIGHLIGHT_COLORS,
} from '../hooks/useHighlight'

interface MarkdownHighlightableContentProps {
  content: string
  itemId: string
  section?: string
  className?: string
}

export function MarkdownHighlightableContent({
  content,
  itemId,
  section = 'content',
  className = '',
}: MarkdownHighlightableContentProps) {
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
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const recolorPickerRef = useRef<HTMLInputElement>(null)
  const newPickerRef = useRef<HTMLInputElement>(null)

  // Stash refs for native event handlers
  const selectionRef = useRef(selection)
  const activeHlRef = useRef(activeHighlight)
  selectionRef.current = selection
  activeHlRef.current = activeHighlight

  // ── Apply highlights using mark.js ──────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    // Create mark instance for the container
    const instance = new Mark(containerRef.current)

    // First, unmark any previous custom marks from our instance
    instance.unmark({
      className: 'hl-span',
      done: () => {
        // Then apply all current highlights
        if (highlights.length === 0) return

        highlights.forEach((hl) => {
          instance.markRanges([{ start: hl.start, length: hl.end - hl.start }], {
            element: 'span',
            className: 'hl-span',
            each: (node) => {
              const el = node as HTMLElement
              el.style.backgroundColor = hl.color
              el.style.boxShadow = `0 0 0 1px ${hl.color}`
              el.style.padding = '1px 2px'
              el.style.borderRadius = '2px'
              el.classList.add('cursor-pointer', 'transition-all', 'hover:brightness-90', 'relative')
              el.title = 'Click to edit highlight'

              // Handle click to show toolbar for this highlight
              el.onclick = (e) => {
                e.preventDefault()
                e.stopPropagation()
                const rect = el.getBoundingClientRect()
                const containerRect = containerRef.current?.getBoundingClientRect()
                if (containerRect) {
                  setToolbarPos({
                    x: rect.left + rect.width / 2 - containerRect.left,
                    y: rect.top - containerRect.top - 56,
                  })
                }
                setActiveHighlight(hl.id)
                setShowToolbar(true)
              }
            }
          })
        })
      }
    })

    return () => {
      // Clean up instance marks on unmount or re-render
      instance.unmark({ className: 'hl-span' })
    }
  }, [highlights, content])


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

  return (
    <div className={`relative ${className}`}>
      {/* 
        Container for markdown.
        We use prose wrapper to apply Tailwind Typography styles.
      */}
      <div
        ref={containerRef}
        className="prose prose-neutral dark:prose-invert max-w-none select-text marker:text-(--text-muted) prose-a:text-(--accent) hover:prose-a:text-(--accent-hover) prose-headings:font-bold prose-img:rounded-xl"
      >
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        ) : (
          <p className="text-(--text-secondary) italic">No content available.</p>
        )}
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
            <div className="flex flex-col">
              <span className="text-sm font-bold text-(--text-primary) leading-tight">
                {highlights.length} highlight{highlights.length === 1 ? '' : 's'}
              </span>
              <span className="text-[10px] font-medium text-(--text-muted) leading-tight">
                Press <kbd className="rounded border border-(--border-strong) bg-(--bg-surface) px-1 pb-[1px] font-sans text-[9px] shadow-sm uppercase">H</kbd> to quick-highlight
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-HelveticaNow">
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
