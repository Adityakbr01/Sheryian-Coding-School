import { Highlighter } from 'lucide-react'
import { useHighlights } from '../hooks/useHighlights'
import { HighlightsHeader } from '../components/HighlightsHeader'
import { HighlightsFilters } from '../components/HighlightsFilters'
import { HighlightCard } from '../components/HighlightCard'

export function HighlightsPage() {
  const {
    highlights,
    totalPages,
    totalHighlights,
    isLoading,

    // State controls
    activeColor,
    setActiveColor,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    page,
    setPage,

    // Actions
    deleteHighlight,
    handleExport,
  } = useHighlights()

  return (
    <div className="mx-auto w-full max-w-6xl px-2 pt-4 pb-12 md:px-8">
      <HighlightsHeader
        totalHighlights={totalHighlights}
        hasHighlights={highlights.length > 0}
        onExport={() => handleExport(highlights)}
      />

      <div className="mb-8">
        <HighlightsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-(--bg-elevated)" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && highlights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Highlighter className="mb-4 h-12 w-12 text-(--text-muted)" />
          <h3 className="mb-2 text-lg font-bold text-(--text-primary)">
            {searchQuery || activeColor
              ? 'No matching highlights'
              : 'No highlights yet'}
          </h3>
          <p className="max-w-sm text-sm text-(--text-secondary)">
            {searchQuery || activeColor
              ? 'Try adjusting your filters or search query.'
              : 'Open any item and select text to start highlighting. Your highlights will appear here.'}
          </p>
        </div>
      )}

      {/* Highlights Grid */}
      {!isLoading && highlights.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((hl) => (
            <HighlightCard
              key={hl.id}
              hl={hl}
              onDelete={deleteHighlight}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-(--text-secondary) bg-(--bg-surface) border border-(--border-subtle) hover:bg-(--bg-overlay) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-(--text-primary)">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-lg px-4 py-2 text-sm font-medium text-(--text-secondary) bg-(--bg-surface) border border-(--border-subtle) hover:bg-(--bg-overlay) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default HighlightsPage;
