import {
    Search,
    X,
    RefreshCw,
    Orbit,
    Network,
    Maximize,
    LocateFixed,
    Link2,
    Tag,
} from 'lucide-react'

interface GraphToolbarProps {
    searchQuery: string
    setSearchQuery: (q: string) => void
    hasSearch: boolean
    searchMatchCount: number
    isSyncing: boolean
    onSync: () => void
    viewMode: 'network' | 'hierarchy'
    setViewMode: (mode: 'network' | 'hierarchy') => void
    onMaximize: () => void
    onFitView: () => void
    showWeakLinks: boolean
    setShowWeakLinks: (value: boolean) => void
    showTagNodes: boolean
    setShowTagNodes: (value: boolean) => void
}

export function GraphToolbar({
    searchQuery,
    setSearchQuery,
    hasSearch,
    searchMatchCount,
    isSyncing,
    onSync,
    viewMode,
    setViewMode,
    onMaximize,
    onFitView,
    showWeakLinks,
    setShowWeakLinks,
    showTagNodes,
    setShowTagNodes,
}: GraphToolbarProps) {
    return (
        <div className="pointer-events-none absolute top-4 right-4 left-4 z-10 flex items-start justify-between gap-3 max-lg:flex-col">
            <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-4 shadow-xl backdrop-blur-md">
                <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#4648d4] to-[#6063ee] shadow-lg">
                        <Orbit className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-manrope leading-tight font-extrabold text-(--text-primary)">
                            Knowledge Graph
                        </h3>
                        <p className="text-[10px] font-bold tracking-widest text-(--accent) uppercase">
                            Interactive Memory Topology
                        </p>
                    </div>
                </div>

                <div className="relative mt-3">
                    <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-(--text-muted)" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search title, tags, summary..."
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

                <div className="mt-2 flex items-center justify-between text-[10px]">
                    <p className="text-(--text-secondary)">
                        {hasSearch
                            ? `${searchMatchCount} node${searchMatchCount !== 1 ? 's' : ''} matched`
                            : 'Hover previews, click a node to pin details'}
                    </p>
                    <p className="text-(--text-muted)">Tip: drag to move, click same node to unpin</p>
                </div>
            </div>

            <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2 max-lg:w-full max-lg:justify-start">
                <button
                    onClick={onSync}
                    disabled={isSyncing}
                    className="group rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-3 text-(--text-primary) shadow-lg backdrop-blur transition-all hover:bg-(--accent) hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    title="Run Vector Correlation Sync"
                >
                    <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>

                <div className="flex items-center gap-1 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-1.5 shadow-lg backdrop-blur">
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
                    <div className="mx-1 h-5 w-px bg-(--border-subtle)" />
                    <button
                        title="Fit graph to viewport"
                        onClick={onFitView}
                        className="rounded-xl p-2 text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    >
                        <LocateFixed className="h-4 w-4" />
                    </button>
                    <button
                        title="Fullscreen"
                        onClick={onMaximize}
                        className="rounded-xl p-2 text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    >
                        <Maximize className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 rounded-2xl border border-(--border-subtle) bg-(--bg-elevated)/90 p-1.5 shadow-lg backdrop-blur">
                    <button
                        onClick={() => setShowWeakLinks(!showWeakLinks)}
                        className={`flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs transition-all ${showWeakLinks ? 'bg-(--accent) text-white' : 'text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)'}`}
                        title="Toggle weak similarity links"
                    >
                        <Link2 className="h-3.5 w-3.5" />
                        <span>Weak</span>
                    </button>
                    <button
                        onClick={() => setShowTagNodes(!showTagNodes)}
                        className={`flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs transition-all ${showTagNodes ? 'bg-(--accent) text-white' : 'text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)'}`}
                        title="Toggle tag nodes"
                    >
                        <Tag className="h-3.5 w-3.5" />
                        <span>Tags</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
