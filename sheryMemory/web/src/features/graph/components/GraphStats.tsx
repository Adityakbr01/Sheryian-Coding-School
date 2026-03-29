import { type ReactNode } from 'react'
import { Sparkles, Tag, Link2, Activity } from 'lucide-react'

interface GraphStatsProps {
    itemNodes: number
    tagNodes: number
    links: number
    avgDegree: number
    density: number
}

function StatChip({
    label,
    value,
    icon,
}: {
    label: string
    value: string
    icon: ReactNode
}) {
    return (
        <div className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/90 px-3 py-2 shadow-lg backdrop-blur">
            {icon}
            <div className="leading-tight">
                <p className="text-[9px] font-bold tracking-widest text-(--text-muted) uppercase">
                    {label}
                </p>
                <p className="text-xs font-bold text-(--text-primary)">{value}</p>
            </div>
        </div>
    )
}

export function GraphStats({
    itemNodes,
    tagNodes,
    links,
    avgDegree,
    density,
}: GraphStatsProps) {
    return (
        <div className="pointer-events-none absolute right-4 bottom-4 left-4 z-10 flex flex-wrap items-end justify-between gap-3">
            <div className="pointer-events-auto flex flex-wrap gap-2">
                <StatChip
                    label="Items"
                    value={String(itemNodes)}
                    icon={<Sparkles className="h-3.5 w-3.5 text-(--accent)" />}
                />
                <StatChip
                    label="Tags"
                    value={String(tagNodes)}
                    icon={<Tag className="h-3.5 w-3.5 text-[#a855f7]" />}
                />
                <StatChip
                    label="Links"
                    value={String(links)}
                    icon={<Link2 className="h-3.5 w-3.5 text-(--accent)" />}
                />
                <StatChip
                    label="Avg Degree"
                    value={avgDegree.toFixed(2)}
                    icon={<Activity className="h-3.5 w-3.5 text-[#22c55e]" />}
                />
            </div>

            <div className="pointer-events-auto rounded-xl border border-(--border-subtle) bg-(--bg-elevated)/90 px-4 py-3 shadow-lg backdrop-blur max-md:hidden">
                <p className="mb-2 text-[9px] font-bold tracking-widest text-(--text-muted) uppercase">
                    Legend
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                        <span className="text-[10px] text-(--text-secondary)">Video</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
                        <span className="text-[10px] text-(--text-secondary)">Article</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#1da1f2]" />
                        <span className="text-[10px] text-(--text-secondary)">Tweet</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                        <span className="text-[10px] text-(--text-secondary)">PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rotate-45 rounded-sm bg-[#a855f7]" />
                        <span className="text-[10px] text-(--text-secondary)">Tag</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-px w-3 bg-[#22c55e]" />
                        <span className="text-[10px] text-(--text-secondary)">
                            Density {(density * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
