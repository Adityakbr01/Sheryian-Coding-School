import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { negotiateApi } from '../api/negotiate.api'
import { TacticBadge } from '../components/TacticBadge'
import type { Tactic, Mood } from '../types/negotiate.types'

const MOOD_EMOJI: Record<Mood, string> = {
  neutral: '😐',
  happy: '😊',
  annoyed: '😤',
  desperate: '😰',
}

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => negotiateApi.getSession(sessionId!),
    enabled: !!sessionId,
  })

  const session = data?.data

  useEffect(() => {
    if (session && !session.isComplete) navigate(`/game/${sessionId}`)
  }, [session])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-(--text-muted)">
        Loading results...
      </div>
    )
  }

  if (isError || !session) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-(--text-muted)">Could not load results.</p>
        <Link to="/" className="text-(--accent) hover:underline">
          Go Home
        </Link>
      </div>
    )
  }

  const finalPrice = session.finalPrice ?? session.currentPrice
  const discountPct =
    Math.round(
      ((session.basePrice - finalPrice) / session.basePrice) * 100 * 10,
    ) / 10
  const isWin = session.success
  const isWalkaway = session.isWalkaway

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      {/* Result Banner */}
      <div
        className={`rounded-2xl p-8 text-center ${
          isWalkaway
            ? 'bg-red-50 dark:bg-red-900/20'
            : isWin
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-yellow-50 dark:bg-yellow-900/20'
        }`}
      >
        <div className="mb-2 text-6xl">
          {isWalkaway ? '🚶' : isWin ? '🎉' : '⏰'}
        </div>
        <h1 className="font-HelveticaNow text-3xl font-bold text-(--text-primary)">
          {isWalkaway
            ? 'Seller Walked Away'
            : isWin
              ? 'Deal Secured!'
              : 'Negotiation Ended'}
        </h1>
        <p className="mt-2 text-(--text-secondary)">
          {isWalkaway
            ? 'The seller got fed up. Better luck next time!'
            : isWin
              ? `You negotiated like a pro!`
              : 'Time ran out, but you gave it a shot!'}
        </p>
      </div>

      {/* Stats Card */}
      <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-6">
        <h2 className="mb-4 font-semibold text-(--text-primary)">
          📊 Session Summary
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-(--bg-elevated) p-3 text-center">
            <div className="text-2xl font-bold text-(--accent)">
              ₹{finalPrice.toLocaleString()}
            </div>
            <div className="text-xs text-(--text-muted)">Final Price</div>
          </div>
          <div className="rounded-lg bg-(--bg-elevated) p-3 text-center">
            <div className="text-2xl font-bold text-green-500">
              {discountPct}%
            </div>
            <div className="text-xs text-(--text-muted)">Discount Achieved</div>
          </div>
          <div className="rounded-lg bg-(--bg-elevated) p-3 text-center">
            <div className="text-2xl font-bold text-(--text-primary)">
              {session.totalRounds}
            </div>
            <div className="text-xs text-(--text-muted)">Rounds Played</div>
          </div>
          <div className="rounded-lg bg-(--bg-elevated) p-3 text-center">
            <div className="text-2xl font-bold text-(--text-primary)">
              {session.tacticsUsed.length}
            </div>
            <div className="text-xs text-(--text-muted)">Tactics Used</div>
          </div>
        </div>
      </div>

      {/* Tactics Used */}
      {session.tacticsUsed.length > 0 && (
        <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-6">
          <h2 className="mb-3 font-semibold text-(--text-primary)">
            🎭 Tactics Used
          </h2>
          <div className="flex flex-wrap gap-2">
            {session.tacticsUsed.map((t) => (
              <TacticBadge key={t} tactic={t as Tactic} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Mood Journey */}
      {session.moodHistory.length > 0 && (
        <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-6">
          <h2 className="mb-3 font-semibold text-(--text-primary)">
            😶 Seller's Mood Journey
          </h2>
          <div className="flex flex-wrap gap-2">
            {session.moodHistory.map((m, i) => (
              <span key={i} className="text-2xl" title={m}>
                {MOOD_EMOJI[m as Mood]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/"
          className="flex-1 rounded-xl border border-(--border-default) bg-(--bg-elevated) py-3 text-center font-bold text-(--text-primary) hover:bg-(--bg-overlay)"
        >
          🏠 Play Again
        </Link>
        <Link
          to="/leaderboard"
          className="flex-1 rounded-xl bg-(--accent) py-3 text-center font-bold text-white hover:opacity-90"
        >
          🏆 Leaderboard
        </Link>
      </div>
    </div>
  )
}
