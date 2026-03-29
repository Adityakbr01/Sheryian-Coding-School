import { ArrowRight, X } from 'lucide-react'
import type { GraphNode } from '../types/graph.types'

const NODE_COLORS: Record<string, string> = {
    video: '#ef4444',
    article: '#3b82f6',
    tweet: '#1da1f2',
    pdf: '#f97316',
    tag: '#a855f7',
    default: '#8b5cf6',
}

interface GraphNodeDialogProps {
    node: GraphNode | null
    relatedItemNodes: GraphNode[]
    formatLabel: (name: string) => string
    onClose: () => void
    onOpenItem: (itemId: string) => void
}

export function GraphNodeDialog({
    node,
    relatedItemNodes,
    formatLabel,
    onClose,
    onOpenItem,
}: GraphNodeDialogProps) {
    if (!node) return null

    const isItemNode = node.nodeType === 'item'

    return (
        <aside className="pointer-events-auto absolute top-20 right-4 z-30 flex max-h-[calc(100%-6rem)] w-[min(calc(100%-2rem),24rem)] flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface)/95 shadow-2xl backdrop-blur-md max-md:right-1/2 max-md:translate-x-1/2">
            <div className="flex shrink-0 items-start justify-between gap-3 p-4 border-b border-(--border-subtle)">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                        <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                                backgroundColor:
                                    node.color || NODE_COLORS[node.type] || NODE_COLORS.default,
                            }}
                        />
                        <span className="text-[10px] font-bold tracking-wider text-(--text-muted) uppercase">
                            {node.type}
                        </span>
                    </div>
                    <h3 className="line-clamp-2 text-lg leading-tight font-extrabold text-(--text-primary)">
                        {formatLabel(node.name)}
                    </h3>
                    <p className="mt-1 text-[11px] text-(--text-muted)">
                        Press ESC to close
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="rounded-lg border border-(--border-subtle) p-2 text-(--text-muted) transition hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    aria-label="Close node dialog"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {node.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-base)">
                        <img
                            src={node.imageUrl}
                            alt={formatLabel(node.name)}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="h-40 w-full object-cover"
                            onError={(event) => {
                                event.currentTarget.style.display = 'none'
                            }}
                        />
                    </div>
                )}

                {node.summary && (
                    <p className="text-sm leading-relaxed text-(--text-secondary)">
                        {node.summary}
                    </p>
                )}

                {node.tags && node.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {node.tags.slice(0, 15).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-(--accent)/20 bg-(--accent)/10 px-2.5 py-1 text-[10px] font-semibold text-(--accent)"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {isItemNode && (
                    <button
                        onClick={() => onOpenItem(node.id)}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--accent-hover) shadow-lg shadow-(--accent)/20"
                    >
                        Open Full Detail
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}

                <div className="mt-6 border-t border-(--border-subtle) pt-5">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold tracking-wider text-(--text-muted) uppercase">
                            Knowledge Context
                        </h4>
                        <span className="rounded-md bg-(--bg-elevated) px-2 py-0.5 text-[10px] font-bold text-(--text-secondary)">
                            {relatedItemNodes.length} Connections
                        </span>
                    </div>

                    {relatedItemNodes.length > 0 ? (
                        <div className="space-y-2">
                            {relatedItemNodes.slice(0, 12).map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onOpenItem(item.id)}
                                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/40 px-3 py-2.5 text-left transition hover:border-(--accent)/40 hover:bg-(--bg-overlay)"
                                >
                                    <div className="min-w-0">
                                        <p className="line-clamp-1 text-sm font-semibold text-(--text-primary)">
                                            {formatLabel(item.name)}
                                        </p>
                                        <p className="mt-0.5 text-[10px] font-bold tracking-wide text-(--text-muted) uppercase">
                                            {item.type}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-(--accent)/40" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-(--border-subtle) p-4 text-center">
                            <p className="text-xs text-(--text-muted)">
                                No interconnected nodes detected.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
}
