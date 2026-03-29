import { useState, useEffect, useCallback } from 'react'
import { useResurfacedItems } from '../../memory/hooks/useMemory'
import { useSemanticSearch } from '../../items/hooks/useItems'
import type { DashboardTab, FeedFilter, DashboardNotification } from '../types/dashboard.types'

export function useDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    return (localStorage.getItem('dashboard_active_tab') as DashboardTab) || 'home'
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('recent')
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const { data: resurfacedItems } = useResurfacedItems()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { results: searchResults, isLoading: isSearchLoading } = useSemanticSearch(debouncedQuery, 5)

  useEffect(() => {
    const handleNotification = (e: any) => {
      setNotifications((prev) => [e.detail, ...prev])
    }
    window.addEventListener('memory:notification', handleNotification)
    return () => window.removeEventListener('memory:notification', handleNotification)
  }, [])

  useEffect(() => {
    localStorage.setItem('dashboard_active_tab', activeTab)
  }, [activeTab])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev)
  }, [])

  const closeNotifications = useCallback(() => {
    setShowNotifications(false)
  }, [])

  return {
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    feedFilter,
    setFeedFilter,
    notifications,
    showNotifications,
    setShowNotifications,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchResults,
    isSearchLoading,
    resurfacedItems,
    clearNotifications,
    toggleNotifications,
    closeNotifications
  }
}
