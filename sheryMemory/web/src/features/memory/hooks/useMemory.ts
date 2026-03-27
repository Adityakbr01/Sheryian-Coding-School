import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { memoryApi } from '../api/memory.api'
import type { Item } from '../../items/types/items.types'

export function useResurfacedItems() {
  return useQuery<Item[], Error>({
    queryKey: ['memory', 'resurfaced'],
    queryFn: memoryApi.getResurfacedItems,
    staleTime: 1000 * 60 * 60, // Keep stale for 1 hour to prevent constant feed reshuffling
  })
}

export function useMarkReviewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: memoryApi.markItemReviewed,
    onSuccess: (_, itemId) => {
      // Invalidate both lists when an item is reviewed
      queryClient.invalidateQueries({ queryKey: ['memory', 'resurfaced'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item', itemId] })
    },
  })
}
