export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  context?: any[]
  createdAt: string
}

export interface Session {
  id: string
  title: string
  updatedAt: string
}

export type ChatMode = 'search' | 'explore' | 'recall'
