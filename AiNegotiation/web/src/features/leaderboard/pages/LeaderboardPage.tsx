import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  leaderboardApi,
  type BestDeal,
  type LeaderboardEntry as GlobalEntry,
} from '../api/leaderboard.api'
import { useAuthStore } from '../../auth/store/auth.store'
import { Link } from 'react-router-dom'

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-green-500',
  medium: 'text-yellow-500',
  hard: 'text-red-500',
}

export default function LeaderboardPage() {
  const { isAuthenticated } = useAuthStore()
  const [tab, setTab] = useState<'global' | 'deals'>('global')

  const { data: globalData, isLoading: globalLoading } = useQuery({
    queryKey: ['leaderboard-global'],
    queryFn: leaderboardApi.getGlobal,
  })

  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['leaderboard-deals'],
    queryFn: leaderboardApi.getBestDeals,
  })

  const { data: myRankData } = useQuery({
    queryKey: ['my-rank'],
    queryFn: leaderboardApi.getMyRank,
    enabled: isAuthenticated,
  })

  const globalItems = Array.isArray(globalData?.data)
    ? globalData.data
    : ((globalData?.data as any)?.items ?? [])
  const globalCacheInfo = (globalData?.data as any)?.cache

  const dealsItems = Array.isArray(dealsData?.data)
    ? dealsData.data
    : ((dealsData?.data as any)?.items ?? [])
  const dealsCacheInfo = (dealsData?.data as any)?.cache

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="text-center">
        <h1 className="font-HelveticaNow text-4xl font-bold text-(--text-primary)">
          🏆 Leaderboard
        </h1>
        <p className="mt-2 text-(--text-secondary)">
          See who's the best negotiator!
        </p>
        {(globalCacheInfo?.blagCache || dealsCacheInfo?.blagCache) && (
          <p className="mt-2 text-xs text-green-500">
            🔄 Data served from cache (
            {globalCacheInfo?.cachedBy ?? dealsCacheInfo?.cachedBy})
          </p>
        )}
      </div>

      {/* My Rank */}
      {myRankData?.data && (
        <div className="rounded-xl border-2 border-(--accent) bg-(--accent-muted) p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-(--text-primary)">
                Your Rank: #{myRankData.data.rank}
              </div>
              <div className="text-sm text-(--text-secondary)">
                {myRankData.data.wins}W / {myRankData.data.totalSessions} games
                · {myRankData.data.winRate}% win rate
              </div>
            </div>
            <div className="text-2xl font-bold text-(--accent)">
              {myRankData.data.score} pts
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl border border-(--border-default) bg-(--bg-surface) p-1">
        {(['global', 'deals'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-(--accent) text-white'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            {t === 'global' ? '👑 Top Players' : '💰 Best Deals'}
          </button>
        ))}
      </div>

      {/* Global Tab */}
      {tab === 'global' && (
        <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--card-bg)">
          {globalLoading ? (
            <div className="p-8 text-center text-(--text-muted)">
              Loading...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                  <th className="px-4 py-3 text-left text-(--text-muted)">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-(--text-muted)">
                    Player
                  </th>
                  <th className="px-4 py-3 text-right text-(--text-muted)">
                    Score
                  </th>
                  <th className="px-4 py-3 text-right text-(--text-muted)">
                    Wins
                  </th>
                  <th className="px-4 py-3 text-right text-(--text-muted)">
                    Win%
                  </th>
                </tr>
              </thead>
              <tbody>
                {globalItems.map((entry: GlobalEntry) => (
                  <tr
                    key={entry.userId}
                    className="border-b border-(--border-subtle) hover:bg-(--bg-elevated)"
                  >
                    <td className="px-4 py-3 font-bold text-(--text-primary)">
                      {RANK_MEDAL[entry.rank] ?? `#${entry.rank}`}
                    </td>
                    <td className="px-4 py-3 font-medium text-(--text-primary)">
                      {entry.name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-(--accent)">
                      {entry.score}
                    </td>
                    <td className="px-4 py-3 text-right text-(--text-secondary)">
                      {entry.wins}
                    </td>
                    <td className="px-4 py-3 text-right text-(--text-secondary)">
                      {entry.winRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Best Deals Tab */}
      {tab === 'deals' && (
        <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--card-bg)">
          {dealsLoading ? (
            <div className="p-8 text-center text-(--text-muted)">
              Loading...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                  <th className="px-4 py-3 text-left text-(--text-muted)">#</th>
                  <th className="px-4 py-3 text-left text-(--text-muted)">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-(--text-muted)">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-right text-(--text-muted)">
                    Level
                  </th>
                  <th className="px-4 py-3 text-right text-(--text-muted)">
                    By
                  </th>
                </tr>
              </thead>
              <tbody>
                {dealsItems.map((deal: BestDeal) => (
                  <tr
                    key={deal.rank}
                    className="border-b border-(--border-subtle) hover:bg-(--bg-elevated)"
                  >
                    <td className="px-4 py-3 font-bold text-(--text-primary)">
                      {RANK_MEDAL[deal.rank] ?? `#${deal.rank}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-(--text-primary)">
                        {deal.productName}
                      </div>
                      <div className="text-xs text-(--text-muted)">
                        ₹{deal.finalPrice?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-500">
                      {deal.discountPct}%
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium capitalize ${DIFFICULTY_COLOR[deal.difficulty] ?? ''}`}
                    >
                      {deal.difficulty}
                    </td>
                    <td className="px-4 py-3 text-right text-(--text-secondary)">
                      {deal.playerName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="text-center">
        <Link
          to="/"
          className="rounded-xl bg-(--accent) px-8 py-3 font-bold text-white hover:opacity-90"
        >
          🛒 Start Negotiating
        </Link>
      </div>
    </div>
  )
}
