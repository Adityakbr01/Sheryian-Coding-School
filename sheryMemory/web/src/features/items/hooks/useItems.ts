import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

  // Delete item with optimistic update
  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['items', collectionId, page, limit] })
      const previousItems = queryClient.getQueryData<any>(['items', collectionId, page, limit])
      // Optimistically update cache
      queryClient.setQueryData(['items', collectionId, page, limit], (old: any) => {
        const responseData = old?.data
        const itemsData = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData?.data
            : Array.isArray(responseData?.items)
              ? responseData?.items
              : []
        const newItems = itemsData.filter((item: any) => item.id !== id)
        if (Array.isArray(responseData)) {
          return { ...old, data: newItems }
        } else if (Array.isArray(responseData?.data)) {
          return { ...old, data: { ...responseData, data: newItems } }
        } else if (Array.isArray(responseData?.items)) {
          return { ...old, data: { ...responseData, items: newItems } }
        }
        return old
      })
      return { previousItems }
    },
    onError: (_err, _id, context: any) => {
      // Rollback cache
      if (context?.previousItems) {
        queryClient.setQueryData(['items', collectionId, page, limit], context.previousItems)
      }
    },
    onSettled: () => {
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
