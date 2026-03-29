export interface HighlightWithItem {
  id: string
  itemId: string
  userId: string
  text: string
  start: number
  end: number
  color: string
  createdAt: string
  item: {
    id: string
    title: string | null
    url: string
    type: string
    imageUrl: string | null
  }
}

export interface HighlightsResponse {
  data: HighlightWithItem[]
  totalPages: number
  total: number
}

export type HighlightsSortBy = 'newest' | 'oldest' | 'color'
