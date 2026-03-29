import { motion } from 'motion/react'
import { ItemsGrid } from '../../items/components/ItemsGrid'
import type { FeedFilter } from '../types/dashboard.types'

interface DashboardFeedProps {
  filter: FeedFilter
  setFilter: (filter: FeedFilter) => void
}

export function DashboardFeed({ filter, setFilter }: DashboardFeedProps) {
  return (
    <section className="col-span-1 space-y-10 md:col-span-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="mb-2 block text-[11px] font-bold tracking-[0.2em] text-(--text-secondary) uppercase">
            Curation Stream
          </span>
          <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-(--text-primary)">
            Main Feed
          </h2>
        </div>
        <div className="relative flex gap-1 rounded-full w-fit border border-(--border-subtle) bg-(--bg-elevated) p-1 shadow-sm">
          {(['recent', 'relevant'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`relative z-10 cursor-pointer rounded-full px-6 py-2 text-xs font-bold transition-colors ${filter === tab
                ? 'text-(--text-primary)'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
                }`}
            >
              {filter === tab && (
                <motion.div
                  layoutId="activeFeedTab"
                  className="absolute inset-0 rounded-full border border-(--border-subtle) bg-(--bg-surface) shadow-sm"
                  transition={{
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}
              <span className="relative z-20 capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </header>

      <ItemsGrid filter={filter} />
    </section>
  )
}
