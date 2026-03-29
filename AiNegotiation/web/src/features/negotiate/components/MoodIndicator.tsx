import type { Mood } from '../types/negotiate.types'

const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; color: string; bg: string }> = {
  neutral: { emoji: '😐', label: 'Neutral', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
  happy: { emoji: '😊', label: 'Happy', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  annoyed: { emoji: '😤', label: 'Annoyed', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  desperate: { emoji: '😰', label: 'Desperate', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
}

interface Props {
  mood: Mood
  moodHistory?: Mood[]
}

export function MoodIndicator({ mood, moodHistory = [] }: Props) {
  const config = MOOD_CONFIG[mood]

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-500 ${config.bg} ${config.color}`}
      >
        <span className="text-xl">{config.emoji}</span>
        <div>
          <div className="text-xs font-medium opacity-70">Seller Mood</div>
          <div className="font-bold">{config.label}</div>
        </div>
      </div>

      {moodHistory.length > 1 && (
        <div className="flex gap-1">
          {moodHistory.slice(-8).map((m, i) => (
            <span
              key={i}
              className="text-sm"
              title={m}
            >
              {MOOD_CONFIG[m].emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

