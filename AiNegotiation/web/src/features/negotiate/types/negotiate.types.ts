export type Mood = 'neutral' | 'happy' | 'annoyed' | 'desperate'
export type Tactic = 'emotional' | 'logical' | 'aggressive' | 'passive' | 'flattery' | 'anchor'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Message {
  role: 'user' | 'ai'
  content: string
  tactic?: Tactic
  mood?: Mood
  priceAtRound?: number
  timestamp?: string
}

export interface NegotiationSession {
  sessionId: string
  productName: string
  productEmoji?: string
  basePrice: number
  currentPrice: number
  minimumPrice?: number
  finalPrice?: number
  mood: Mood
  totalRounds: number
  maxRounds: number
  difficulty: Difficulty
  isComplete: boolean
  success?: boolean
  isWalkaway?: boolean
  messages: Message[]
  tacticsUsed: Tactic[]
  moodHistory: Mood[]
}

export interface NegotiateResponse {
  reply: string
  newPrice: number
  mood: Mood
  tactic: Tactic
  tacticConfidence: number
  roundNumber: number
  isWalkaway: boolean
  dealClosed: boolean
  discount: number
}

export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  minimumPrice: number
  emoji: string
}

