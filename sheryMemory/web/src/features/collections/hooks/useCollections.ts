import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsApi } from '../api/collections.api'

export function useCollections() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: collectionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: collectionsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      collectionsApi.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  return {
    collections: data?.data || [],
    isLoading,
    error,
    createCollection: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateCollection: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteCollection: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}

export function useCollection(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionsApi.get(id),
    enabled: !!id,
  })

  return {
    collection: data?.data,
    isLoading,
    error,
  }
}
