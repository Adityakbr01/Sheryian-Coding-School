import { Wand2, Network } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

interface DashboardWidgetsProps {
  resurfacedItems?: any[]
  onOpenGraph: () => void
}

export function DashboardWidgets({ resurfacedItems, onOpenGraph }: DashboardWidgetsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const getFuzzyTime = (date: string | Date | undefined) => {
    if (!date) return 'Forgotten insight'
    const days = Math.round(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
    )
    if (days === 0) return 'Added Today'
    if (days < 7) return `From ${days} days ago`
    if (days < 30) return `From ${Math.floor(days / 7)} weeks ago`
    return `From ${Math.floor(days / 30)} months ago`
  }

  return (
    <aside className="col-span-1 space-y-8 md:col-span-4">
      {/* Daily Feed Widget */}
      <div className="rounded-3xl border border-(--border-subtle) bg-(--bg-surface) p-8 shadow-(--border-subtle)/30 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="font-manrope text-lg font-bold text-(--text-primary)">
            Daily Knowledge
          </h3>
          <Wand2 className="h-5 w-5 text-(--accent)" />
        </div>
        <div className="space-y-6">
          {resurfacedItems?.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/items/${item.id}`)}
              className="group relative cursor-pointer border-l-2 border-(--accent)/30 pl-6 transition-colors hover:border-(--accent)"
            >
              <span className="mb-1 block text-[10px] font-bold tracking-widest text-(--text-muted) uppercase">
                {getFuzzyTime(item.createdAt)}
              </span>
              <p className="line-clamp-2 text-sm font-semibold text-(--text-primary) transition-colors group-hover:text-(--accent)">
                {item.title || item.url}
              </p>
            </div>
          ))}
          {(!resurfacedItems || resurfacedItems.length === 0) && (
            <div className="text-sm text-(--text-secondary)">
              Your memory engine is indexing. Save some items to launch
              your knowledge resurfacer!
            </div>
          )}
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['memory'] })}
          className="mt-10 w-full cursor-pointer rounded-xl border border-(--border-subtle) bg-(--bg-elevated) py-3 text-xs font-bold tracking-widest text-(--text-secondary) uppercase transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
        >
          Shuffle Feed
        </button>
      </div>

      {/* Collections Teaser */}
      <div className="group relative overflow-hidden rounded-3xl bg-(--accent) p-8 text-(--text-on-accent) shadow-(--accent)/20 shadow-xl">
        <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-(--bg-base)/10 transition-transform duration-1000 group-hover:scale-150"></div>
        <Network className="mb-4 h-8 w-8 text-(--text-on-accent)" />
        <h3 className="font-manrope mb-2 text-xl font-bold">
          Knowledge Graph
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-(--text-on-accent)/80">
          You have multiple unconnected thoughts. Visualize
          relationships now.
        </p>
        <button
          onClick={onOpenGraph}
          className="relative z-10 cursor-pointer rounded-xl bg-(--bg-base) px-6 py-2.5 text-xs font-bold tracking-wider text-(--accent) uppercase shadow-sm transition-colors hover:bg-(--bg-surface)"
        >
          Open Graph
        </button>
      </div>
    </aside>
  )
}
