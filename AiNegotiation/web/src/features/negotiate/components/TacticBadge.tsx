import type { Tactic } from '../types/negotiate.types'

const TACTIC_CONFIG: Record<Tactic, { label: string; color: string }> = {
  emotional: {
    label: '💔 Emotional',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  },
  logical: {
    label: '🧠 Logical',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  aggressive: {
    label: '⚡ Aggressive',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  passive: {
    label: '🤷 Passive',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  flattery: {
    label: '🌹 Flattery',
    color:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  anchor: {
    label: '⚓ Anchor',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
}

interface Props {
  tactic: Tactic
  confidence?: number
  size?: 'sm' | 'md'
}

export function TacticBadge({ tactic, confidence, size = 'sm' }: Props) {
  const config = TACTIC_CONFIG[tactic]
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${px} ${config.color}`}
    >
      {config.label}
      {confidence !== undefined && (
        <span className="opacity-60">({Math.round(confidence * 100)}%)</span>
      )}
    </span>
  )
}
