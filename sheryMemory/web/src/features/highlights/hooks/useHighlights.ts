import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { highlightsApi } from '../api/highlights.api'
import type { HighlightsSortBy } from '../types/highlights.types'

export function useHighlights() {
  const queryClient = useQueryClient()
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<HighlightsSortBy>('newest')
  const [page, setPage] = useState(1)
  const limit = 12

  // Query highlights
  const { data: highlightsResponse, isLoading, error } = useQuery({
    queryKey: ['highlights-all', activeColor, page, searchQuery, sortBy],
    queryFn: () => highlightsApi.getAll(activeColor || undefined, page, limit, searchQuery, sortBy),
    staleTime: 30 * 1000,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: highlightsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights-all'] })
    },
  })

  // Export feature
  const handleExport = (highlights: any[]) => {
    if (highlights.length === 0) return
    const exportData = highlights.map((h) => ({
      text: h.text,
      color: h.color,
      itemTitle: h.item.title,
      date: new Date(h.createdAt).toISOString(),
    }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-highlights.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    highlights: highlightsResponse?.data || [],
    totalPages: highlightsResponse?.totalPages || 1,
    totalHighlights: highlightsResponse?.total || 0,
    isLoading,
    error,
    
    // State controls
    activeColor,
    setActiveColor: (color: string | null) => { setActiveColor(color); setPage(1); },
    searchQuery,
    setSearchQuery: (query: string) => { setSearchQuery(query); setPage(1); },
    sortBy,
    setSortBy: (sort: HighlightsSortBy) => { setSortBy(sort); setPage(1); },
    page,
    setPage,
    
    // Actions
    deleteHighlight: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    handleExport,
  }
}
