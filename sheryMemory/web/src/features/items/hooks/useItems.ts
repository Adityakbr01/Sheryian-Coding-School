import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '../api/items.api'

export function useItems(collectionId?: string, page?: number, limit?: number) {
  const queryClient = useQueryClient()

  // Fetch items
  const { data, isLoading, error } = useQuery({
    queryKey: ['items', collectionId, page, limit],
    queryFn: () => itemsApi.list(collectionId, page, limit),
  })

  // Save new item
  const saveMutation = useMutation({
    mutationFn: ({
      url,
      collectionId,
    }: {
      url: string
      collectionId?: string
    }) => itemsApi.save(url, collectionId),
    onSuccess: () => {
      // Invalidate the cache to trigger a fresh fetch automatically
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  // Save new file
  const saveFileMutation = useMutation({
    mutationFn: ({
      file,
      collectionId,
    }: {
      file: File
      collectionId?: string
    }) => itemsApi.saveFile(file, collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  // Delete item
  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const responseData: any = data?.data
  const itemsData = Array.isArray(responseData) 
    ? responseData 
    : Array.isArray(responseData?.data) 
      ? responseData?.data 
      : Array.isArray(responseData?.items) 
        ? responseData?.items 
        : []
  const paginationData = responseData?.pagination || (data as any)?.pagination || undefined

  return {
    items: itemsData,
    pagination: paginationData,
    isLoading,
    error,
    saveItem: saveMutation.mutate,
    saveFileItem: saveFileMutation.mutate,
    isSaving: saveMutation.isPending || saveFileMutation.isPending,
    saveError: saveMutation.error || saveFileMutation.error,
    deleteItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}

export function useItem(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsApi.get(id),
    enabled: !!id,
  })

  return {
    item: data?.data,
    isLoading,
    error,
  }
}

export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useSemanticSearch(query: string, limit?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['items', 'search', query, limit],
    queryFn: () => itemsApi.search(query, limit),
    enabled: !!query,
  })

  return {
    results: data?.data || [],
    isLoading,
    error,
  }
}
