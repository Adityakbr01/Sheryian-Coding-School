
import {
    ExternalLink,
    FileText,
    ImageIcon,
    Link as LinkIcon,
    Trash2,
    Video,
    X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Item } from '../types/items.types'


export function ItemCard({ item, onDelete }: { item: Item; onDelete?: () => void }) {
    const TypeIcon = () => {
        switch (item.type) {
            case 'video':
                return <Video className="mr-1 h-3 w-3" />
            case 'article':
            case 'pdf':
                return <FileText className="mr-1 h-3 w-3" />
            case 'image':
                return <ImageIcon className="mr-1 h-3 w-3" />
            case 'tweet':
                return <X className="mr-1 h-3 w-3" />
            default:
                return <LinkIcon className="mr-1 h-3 w-3" />
        }
    }

    return (
        <article className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface) transition-all duration-300 hover:shadow-(--border-strong)/10 hover:shadow-xl">
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex gap-2">
                        <span
                            className={`rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${item.status === 'processed'
                                ? 'bg-(--success-bg) text-(--success-text)'
                                : item.status === 'failed'
                                    ? 'bg-(--error-bg) text-(--error-text)'
                                    : 'bg-[#fbbf24]/10 text-[#d97706]'
                                }`}
                        >
                            {item.status}
                        </span>
                        <span className="flex items-center rounded-md border border-(--tab-border) bg-(--tab-bg) px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--tab-text) uppercase">
                            <TypeIcon />
                            {item.type}
                        </span>
                    </div>
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="z-10 cursor-pointer rounded-lg p-1 text-(--text-muted) transition-colors hover:bg-(--error-bg) hover:text-(--error-text)"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Link to={`/items/${item.id}`}>
                    <h3 className="font-manrope mb-2 cursor-pointer text-lg leading-snug font-bold text-(--text-primary) transition-colors group-hover:text-(--accent)">
                        {item.title || item.url}
                    </h3>
                </Link>

                {item.content && (
                    <p className="mb-6 line-clamp-2 text-sm text-(--text-secondary) opacity-90">
                        {item.content}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-(--border-subtle) pt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium tracking-wider text-(--text-muted) uppercase">
                            Added to memory
                        </span>
                    </div>
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-transparent text-(--text-secondary) transition-colors hover:border-(--border-subtle) hover:bg-(--bg-elevated) hover:text-(--accent)"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </article>
    )
}
