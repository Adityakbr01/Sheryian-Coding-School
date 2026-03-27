import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphApi } from '../api/graph.api'

export function useGraph() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['graph'],
    queryFn: graphApi.getGraph,
    staleTime: 60 * 1000, // 1 min before auto-fetching
  })

  const syncMutation = useMutation({
    mutationFn: graphApi.syncGraph,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })

  return {
    graphData: data || { nodes: [], links: [] },
    isLoading,
    error,
    syncGraph: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  }
}
