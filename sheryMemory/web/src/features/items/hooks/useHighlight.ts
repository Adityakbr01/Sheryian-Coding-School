import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

// ── Types ─────────────────────────────────────────────────────────
export interface Highlight {
  id: string;
  itemId: string;
  userId: string;
  section: string;
  text: string;
  start: number;
  end: number;
  color: string;
  createdAt: string;
}

export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
];

const API_URL = 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${Cookies.get('token') || ''}`,
});

// ── API Layer ─────────────────────────────────────────────────────
const highlightsApi = {
  getByItem: async (itemId: string): Promise<Highlight[]> => {
    const res = await fetch(`${API_URL}/highlights/item/${itemId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch highlights');
    const json = await res.json();
    return json.data;
  },

  create: async (data: { itemId: string; section: string; text: string; start: number; end: number; color: string }): Promise<Highlight> => {
    const res = await fetch(`${API_URL}/highlights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create highlight');
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

  clearAll: async (itemId: string): Promise<void> => {
    const res = await fetch(`${API_URL}/highlights/item/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to clear highlights');
  },
};

// ── getTextOffset ─────────────────────────────────────────────────
// Uses TreeWalker to calculate the character offset of a node/offset
// pair relative to the full text content of a container.
function getTextOffset(container: Node, targetNode: Node, targetOffset: number): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let node = walker.nextNode();
  while (node) {
    if (node === targetNode) {
      return offset + targetOffset;
    }
    offset += (node.textContent || '').length;
    node = walker.nextNode();
  }
  return offset;
}

// ── useTextSelection ──────────────────────────────────────────────
export function useTextSelection(containerRef: React.RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<{
    text: string;
    start: number;
    end: number;
    rect: DOMRect;
  } | null>(null);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const selectedText = sel.toString().trim();

    if (!containerRef.current || !containerRef.current.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    if (selectedText.length < 2) {
      setSelection(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const start = getTextOffset(containerRef.current, range.startContainer, range.startOffset);
    const end = getTextOffset(containerRef.current, range.endContainer, range.endOffset);

    if (start >= end || start < 0) {
      setSelection(null);
      return;
    }

    setSelection({ text: selectedText, start, end, rect });
  }, [containerRef]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  return { selection, clearSelection };
}

// ── useHighlights (Backend-Persisted, section-aware) ──────────────
export function useHighlights(itemId: string, section: string = 'content') {
  const queryClient = useQueryClient();
  const colorKey = 'lastHighlightColor';

  const [lastColor, setLastColorState] = useState<string>(() =>
    localStorage.getItem(colorKey) || HIGHLIGHT_COLORS[0].value
  );

  const setLastColor = useCallback((color: string) => {
    setLastColorState(color);
    localStorage.setItem(colorKey, color);
  }, []);

  // Fetch ALL highlights for this item, then filter by section on client
  const { data: allHighlights = [], isLoading } = useQuery({
    queryKey: ['highlights', itemId],
    queryFn: () => highlightsApi.getByItem(itemId),
    enabled: !!itemId,
    staleTime: 30 * 1000,
  });

  // Filter to just the highlights for this section
  const highlights = allHighlights.filter(h => h.section === section);

  const createMutation = useMutation({
    mutationFn: highlightsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights', itemId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: highlightsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights', itemId] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => highlightsApi.clearAll(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights', itemId] });
      queryClient.invalidateQueries({ queryKey: ['highlights-all'] });
    },
  });

  const addHighlight = useCallback((text: string, start: number, end: number, color: string) => {
    if (start >= end || start < 0 || text.length === 0) return Promise.resolve();
    setLastColor(color);
    return createMutation.mutateAsync({ itemId, section, text, start, end, color });
  }, [itemId, section, createMutation, setLastColor]);

  const removeHighlight = useCallback((id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const clearAllHighlights = useCallback(() => {
    return clearAllMutation.mutateAsync();
  }, [clearAllMutation]);

  const exportHighlights = useCallback(() => {
    const exportData = highlights.map(h => ({
      text: h.text,
      section: h.section,
      color: h.color,
      date: new Date(h.createdAt).toISOString(),
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `highlights-${itemId}-${section}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [highlights, itemId, section]);

  return {
    highlights,
    allHighlights,
    isLoading,
    lastColor,
    setLastColor,
    addHighlight,
    removeHighlight,
    clearAllHighlights,
    exportHighlights,
  };
}
