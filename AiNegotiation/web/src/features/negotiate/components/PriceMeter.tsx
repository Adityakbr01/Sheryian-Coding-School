interface Props {
  basePrice: number
  currentPrice: number
  minimumPrice?: number
}

export function PriceMeter({ basePrice, currentPrice, minimumPrice }: Props) {
  // Range: from basePrice (0%) down to minimumPrice (100%)
  const floor = minimumPrice ?? Math.round(basePrice * 0.6)
  const range = basePrice - floor
  const savings = basePrice - currentPrice
  const pct = range > 0 ? Math.min(100, Math.round((savings / range) * 100)) : 0

  const discountPct = Math.round(((basePrice - currentPrice) / basePrice) * 100)

  const barColor =
    pct < 33 ? 'bg-red-400' : pct < 66 ? 'bg-yellow-400' : 'bg-green-400'

  return (
    <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4">
      <div className="mb-1 flex items-center justify-between text-xs text-(--text-muted)">
        <span>Original: ₹{basePrice.toLocaleString()}</span>
        {minimumPrice && (
          <span className="text-(--text-muted)">Floor hidden 🔒</span>
        )}
      </div>

      <div className="mb-2 text-center">
        <div className="text-2xl font-bold text-(--accent)">
          ₹{currentPrice.toLocaleString()}
        </div>
        {discountPct > 0 && (
          <div className="text-xs font-medium text-green-500">
            -{discountPct}% off original
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-(--bg-elevated)">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-xs text-(--text-muted)">
        <span>High</span>
        <span className="font-medium text-(--text-secondary)">
          {pct}% negotiated
        </span>
        <span>Best Deal</span>
      </div>
    </div>
  )
}
