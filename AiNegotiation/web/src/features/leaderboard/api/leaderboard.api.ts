import { apiFetch } from '../../../lib/api'

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  score: number
  wins: number
  totalSessions: number
  winRate: number
  bestDealPrice: number | null
}

export interface BestDeal {
  rank: number
  productName: string
  basePrice: number
  finalPrice: number
  discountPct: number
  totalRounds: number
  difficulty: string
  playerName: string
  date: string
}

export interface MyRank extends LeaderboardEntry {
  rank: number
}

export interface ResponseWithCache<T> {
  items: T
  cache?: {
    blagCache: boolean
    cachedBy?: string
    source?: string
  }
}

export const leaderboardApi = {
  getGlobal: async (): Promise<{
    data: ResponseWithCache<LeaderboardEntry[]>
  }> => {
    return apiFetch('/leaderboard')
  },
  getBestDeals: async (): Promise<{ data: ResponseWithCache<BestDeal[]> }> => {
    return apiFetch('/leaderboard/best-deals')
  },
  getMyRank: async (): Promise<{ data: MyRank }> => {
    return apiFetch('/leaderboard/me')
  },
}
