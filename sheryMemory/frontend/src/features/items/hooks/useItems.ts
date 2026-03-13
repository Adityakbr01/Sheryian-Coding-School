import { useState, useCallback, useEffect } from 'react'
import { itemsApi } from '../api/items.api'
import { ItemResponse, SaveItemInput } from '../schemas/item.schema'

export function useItems() {
    const [items, setItems] = useState<ItemResponse[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null)

    const fetchItems = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const data = searchQuery.trim()
                ? await itemsApi.searchItems(searchQuery)
                : await itemsApi.getItems(currentCollectionId)

            setItems(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery, currentCollectionId])

    // Poll for updates if any items are pending
    useEffect(() => {
        const hasPending = items.some(item => item.status === 'pending')
        if (!hasPending) return

        const intervalId = setInterval(() => {
            fetchItems()
        }, 3000)

        return () => clearInterval(intervalId)
    }, [items, fetchItems])

    const saveItem = async (input: SaveItemInput) => {
        try {
            setIsLoading(true)
            setError(null)
            const newItem = await itemsApi.saveItem(input)
            setItems(prev => [newItem, ...prev])
            return newItem
        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const deleteItem = async (id: string) => {
        try {
            setIsLoading(true)
            setError(null)
            await itemsApi.deleteItem(id)
            setItems(prev => prev.filter(item => item.id !== id))
        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return {
        items,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        currentCollectionId,
        setCurrentCollectionId,
        fetchItems,
        saveItem,
        deleteItem
    }
}
