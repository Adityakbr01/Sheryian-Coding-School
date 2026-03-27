import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Highlighter, X, Download, Trash2, XCircle } from 'lucide-react';
import {
  useTextSelection,
  useHighlights,
  HIGHLIGHT_COLORS,
  type Highlight,
} from '../hooks/useHighlight';

interface HighlightableContentProps {
  content: string;
  itemId: string;
  section?: string;
  className?: string;
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
  onClickHighlight: (e: React.MouseEvent, id: string) => void
): React.ReactNode[] {
  if (!content) return [];
  if (highlights.length === 0) return [content];

  // Sort by start offset, then by end offset (shorter first)
  const sorted = [...highlights]
    .filter(hl => hl.start >= 0 && hl.end > hl.start && hl.start < content.length)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const hl of sorted) {
    // Clamp to content boundaries
    const start = Math.max(hl.start, cursor); // skip if overlapping
    const end = Math.min(hl.end, content.length);

    if (start >= end) continue; // Skip invalid or fully overlapping

    // Add plain text before this highlight
    if (start > cursor) {
      parts.push(<span key={`plain-${cursor}`}>{content.slice(cursor, start)}</span>);
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
      </span>
    );

    cursor = end;
  }

  // Add remaining plain text
  if (cursor < content.length) {
    parts.push(<span key={`plain-${cursor}`}>{content.slice(cursor)}</span>);
  }

  return parts;
}

// ── Main Component ────────────────────────────────────────────────
export function HighlightableContent({ content, itemId, section = 'content', className = '' }: HighlightableContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selection, clearSelection } = useTextSelection(containerRef);
  const {
    highlights,
    lastColor,
    setLastColor,
    addHighlight,
    removeHighlight,
    clearAllHighlights,
    exportHighlights,
  } = useHighlights(itemId, section);

  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const recolorPickerRef = useRef<HTMLInputElement>(null);
  const newPickerRef = useRef<HTMLInputElement>(null);

  // Stash refs for native event handlers
  const selectionRef = useRef(selection);
  const activeHlRef = useRef(activeHighlight);
  selectionRef.current = selection;
  activeHlRef.current = activeHighlight;

  // ── Native change listener for recolor picker ──────────────
  useEffect(() => {
    const el = recolorPickerRef.current;
    if (!el) return;
    const handler = async (e: Event) => {
      const color = (e.target as HTMLInputElement).value;
      const hlId = activeHlRef.current;
      if (!hlId) return;
      const hl = highlights.find(h => h.id === hlId);
      if (hl) {
        await removeHighlight(hlId);
        await addHighlight(hl.text, hl.start, hl.end, color);
      }
      setActiveHighlight(null);
      setShowToolbar(false);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [highlights, removeHighlight, addHighlight]);

  // ── Native change listener for new highlight picker ────────
  useEffect(() => {
    const el = newPickerRef.current;
    if (!el) return;
    const handler = async (e: Event) => {
      const color = (e.target as HTMLInputElement).value;
      const sel = selectionRef.current;
      if (!sel) return;
      await addHighlight(sel.text, sel.start, sel.end, color);
      setLastColor(color);
      clearSelection();
      setShowToolbar(false);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [addHighlight, setLastColor, clearSelection]);

  // ── Position floating toolbar near selection ───────────────
  useEffect(() => {
    if (selection && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setToolbarPos({
        x: selection.rect.left + selection.rect.width / 2 - containerRect.left,
        y: selection.rect.top - containerRect.top - 56,
      });
      setShowToolbar(true);
    } else if (!activeHighlight) {
      setShowToolbar(false);
    }
  }, [selection, activeHighlight]);

  // ── Keyboard shortcut: H to highlight with last color ──────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        if (selection) {
          handleApplyHighlight(lastColor);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selection, lastColor]);

  // ── Apply highlight ────────────────────────────────────────
  const handleApplyHighlight = useCallback(async (color: string) => {
    if (!selection) return;
    await addHighlight(selection.text, selection.start, selection.end, color);
    setLastColor(color);
    clearSelection();
    setShowToolbar(false);
  }, [selection, addHighlight, setLastColor, clearSelection]);

  // ── Click on existing highlight ────────────────────────────
  const handleHighlightClick = useCallback((e: React.MouseEvent, hlId: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setToolbarPos({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 56,
      });
    }
    setActiveHighlight(hlId);
    setShowToolbar(true);
  }, []);

  // ── Close toolbar on outside click ─────────────────────────
  useEffect(() => {
    const handleClick = () => {
      if (activeHighlight && !selection) {
        setActiveHighlight(null);
        setShowToolbar(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activeHighlight, selection]);

  // ── Memoized highlighted content ───────────────────────────
  const renderedContent = useMemo(
    () => renderHighlightedText(content, highlights, handleHighlightClick),
    [content, highlights, handleHighlightClick]
  );

  return (
    <div className={`relative ${className}`}>
      {/* Highlightable Content Zone — no DOM mutation, pure React state */}
      <div ref={containerRef} className="select-text whitespace-pre-wrap">
        {renderedContent}
      </div>

      {/* ── Floating Toolbar ─────────────────────────────────── */}
      {showToolbar && toolbarPos && (
        <div
          className="absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            left: `${toolbarPos.x}px`,
            top: `${toolbarPos.y}px`,
            transform: 'translateX(-50%)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/20 px-2 py-1.5 flex items-center gap-1">

            {/* Active Highlight: Show remove + recolor */}
            {activeHighlight ? (
              <>
                <button
                  onClick={async () => {
                    await removeHighlight(activeHighlight);
                    setActiveHighlight(null);
                    setShowToolbar(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
                <div className="w-px h-5 bg-[var(--border-subtle)]" />
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={async () => {
                      const hl = highlights.find(h => h.id === activeHighlight);
                      if (hl) {
                        await removeHighlight(activeHighlight);
                        await addHighlight(hl.text, hl.start, hl.end, c.value);
                      }
                      setActiveHighlight(null);
                      setShowToolbar(false);
                    }}
                    className="w-6 h-6 rounded-full border-2 border-transparent hover:border-[var(--text-primary)] transition-all hover:scale-110 active:scale-95"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
                <label className="relative w-6 h-6 rounded-full cursor-pointer border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-all hover:scale-110 flex items-center justify-center" title="Custom color">
                  <span className="text-[8px] font-bold text-[var(--text-muted)]">+</span>
                  <input
                    ref={recolorPickerRef}
                    type="color"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </>
            ) : (
              <>
                {/* New Highlight: Show color picker */}
                <div className="flex items-center gap-0.5 px-1">
                  <Highlighter className="w-3.5 h-3.5 text-[var(--text-muted)] mr-1" />
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleApplyHighlight(c.value)}
                      className={`w-6 h-6 rounded-full transition-all hover:scale-125 active:scale-95 ${lastColor === c.value ? 'ring-2 ring-[var(--text-primary)] ring-offset-1 ring-offset-[var(--bg-elevated)]' : 'border-2 border-transparent hover:border-[var(--border-subtle)]'}`}
                      style={{ backgroundColor: c.value }}
                      title={`${c.name}${lastColor === c.value ? ' (last used)' : ''}`}
                    />
                  ))}
                  <label className="relative w-6 h-6 rounded-full cursor-pointer border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-all hover:scale-110 flex items-center justify-center" title="Pick custom color">
                    <span className="text-[8px] font-bold text-[var(--text-muted)]">+</span>
                    <input
                      ref={newPickerRef}
                      type="color"
                      defaultValue={lastColor}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
                <div className="w-px h-5 bg-[var(--border-subtle)]" />
                <button
                  onClick={() => {
                    clearSelection();
                    setShowToolbar(false);
                  }}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-[var(--bg-elevated)] border-r border-b border-[var(--border-subtle)] rotate-45" />
        </div>
      )}

      {/* ── Highlights Footer Bar ────────────────────────────── */}
      {highlights.length > 0 && (
        <div className="mt-6 flex items-center justify-between bg-[var(--bg-elevated)]/60 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Highlighter className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Press H to quick-highlight
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportHighlights}
              className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-overlay)] rounded-lg transition-colors"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={clearAllHighlights}
              className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <XCircle className="w-3 h-3" />
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
