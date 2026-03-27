import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  Highlighter, Trash2, Download, Search, X, Filter,
  Calendar, ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { HIGHLIGHT_COLORS } from '../features/items/hooks/useHighlight';

// ── Types ─────────────────────────────────────────────────────────
interface HighlightWithItem {
  id: string;
  itemId: string;
  userId: string;
  text: string;
  start: number;
  end: number;
  color: string;
  createdAt: string;
  item: {
    id: string;
    title: string | null;
    url: string;
    type: string;
    imageUrl: string | null;
  };
}

const API_URL = 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${Cookies.get('token') || ''}`,
});

// ── API ───────────────────────────────────────────────────────────
const highlightsApi = {
  getAll: async (color?: string): Promise<HighlightWithItem[]> => {
    const url = new URL(`${API_URL}/highlights`);
    if (color) url.searchParams.append('color', color);
    const res = await fetch(url.toString(), { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch highlights');
    const json = await res.json();
    return json.data;
  },
  remove: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/highlights/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete highlight');
  },
};

// ── Color name lookup ─────────────────────────────────────────────
function getColorName(hex: string): string {
  return HIGHLIGHT_COLORS.find(c => c.value === hex)?.name || 'Custom';
}

// ── Main Component ────────────────────────────────────────────────
export function HighlightsPage() {
  const queryClient = useQueryClient();
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'color'>('newest');

  // Fetch all highlights
  const { data: allHighlights = [], isLoading } = useQuery({
    queryKey: ['highlights-all', activeColor],
    queryFn: () => highlightsApi.getAll(activeColor || undefined),
    staleTime: 30 * 1000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: highlightsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights-all'] });
    },
  });

  // ── Filtered + Sorted ──────────────────────────────────────
  const highlights = useMemo(() => {
    let filtered = allHighlights;

    // Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        h =>
          h.text.toLowerCase().includes(q) ||
          (h.item.title || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'color') {
      filtered = [...filtered].sort((a, b) => a.color.localeCompare(b.color));
    }

    return filtered;
  }, [allHighlights, searchQuery, sortBy]);

  // ── Color stats for sidebar filter ─────────────────────────
  const colorStats = useMemo(() => {
    const map = new Map<string, number>();
    allHighlights.forEach(h => {
      map.set(h.color, (map.get(h.color) || 0) + 1);
    });
    return map;
  }, [allHighlights]);

  // ── Export all ─────────────────────────────────────────────
  const handleExport = () => {
    const exportData = highlights.map(h => ({
      text: h.text,
      color: h.color,
      itemTitle: h.item.title,
      date: new Date(h.createdAt).toISOString(),
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-highlights.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-4 px-2 md:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)] flex items-center justify-center shadow-lg">
              <Highlighter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-manrope text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Highlights
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {allHighlights.length} saved highlight{allHighlights.length !== 1 ? 's' : ''} across your brain
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={highlights.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export All
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search highlights..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="color">Group by Color</option>
          </select>
        </div>
      </div>

      {/* Color Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Filter className="w-4 h-4 text-[var(--text-muted)]" />
        <button
          onClick={() => setActiveColor(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            !activeColor
              ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30'
          }`}
        >
          All ({allHighlights.length})
        </button>
        {HIGHLIGHT_COLORS.map(c => {
          const count = colorStats.get(c.value) || 0;
          return (
            <button
              key={c.value}
              onClick={() => setActiveColor(activeColor === c.value ? null : c.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeColor === c.value
                  ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-base)] shadow-md'
                  : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30'
              }`}
              style={activeColor === c.value ? { backgroundColor: c.value, ringColor: c.value, color: '#1e293b' } : {}}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                style={{ backgroundColor: c.value }}
              />
              <span className={activeColor === c.value ? 'text-slate-800' : 'text-[var(--text-secondary)]'}>
                {c.name} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && highlights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Highlighter className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            {searchQuery || activeColor ? 'No matching highlights' : 'No highlights yet'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            {searchQuery || activeColor
              ? 'Try adjusting your filters or search query.'
              : 'Open any item and select text to start highlighting. Your highlights will appear here.'}
          </p>
        </div>
      )}

      {/* Highlights Grid */}
      {!isLoading && highlights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map(hl => (
            <div
              key={hl.id}
              className="group relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[var(--border-subtle)]/30 transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Color accent bar */}
              <div className="h-1 w-full" style={{ backgroundColor: hl.color }} />

              <div className="p-5">
                {/* Highlighted Text */}
                <div className="mb-4">
                  <p
                    className="text-sm font-medium text-[var(--text-primary)] leading-relaxed line-clamp-4"
                    style={{ borderLeft: `3px solid ${hl.color}`, paddingLeft: '12px' }}
                  >
                    "{hl.text}"
                  </p>
                </div>

                {/* Source Item */}
                <Link
                  to={`/items/${hl.item.id}`}
                  className="flex items-center gap-2 mb-3 group/link"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover/link:text-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-secondary)] group-hover/link:text-[var(--accent)] truncate transition-colors font-medium">
                    {hl.item.title || hl.item.url}
                  </span>
                </Link>

                {/* Meta Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ backgroundColor: hl.color }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      {getColorName(hl.color)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(hl.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteMutation.mutate(hl.id)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove highlight"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
