import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/lib/api'

const SOCKET_URL = API_URL.replace('/api', '')

export function useSocket() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    if (!socketRef.current) {
      console.log(
        '🔄 [Socket Debug] Booting io() connection for user:',
        user.id,
      )
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      })

      socketRef.current.on('connect', () => {
        console.log(
          '🟢 [Socket Debug] Handshake successful! Socket ID:',
          socketRef.current?.id,
        )
        socketRef.current?.emit('join_user_room', user.id)
        console.log('🚪 [Socket Debug] Requested to join room:', user.id)
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('🔴 [Socket Debug] Connection Failed:', error.message)
      })

      // Listen for Queue / Worker completion event
      socketRef.current.on('item_processed', (data: { itemId: string }) => {
        console.log('📡 Received item_processed event for ID:', data.itemId)

        // Invalidate items lists to fresh Grid
        queryClient.invalidateQueries({ queryKey: ['items'] })

        // Invalidate specific item Detail Pages
        queryClient.invalidateQueries({ queryKey: ['item', data.itemId] })
      })

      // Real-time leaderboard updates (data changed on server)
      socketRef.current.on('leaderboard:update', (data: any) => {
        console.log('🏆 Received leaderboard update event', data)
        queryClient.invalidateQueries({ queryKey: ['leaderboard-global'] })
        queryClient.invalidateQueries({ queryKey: ['leaderboard-deals'] })
        queryClient.invalidateQueries({ queryKey: ['my-rank'] })
      })

      // Real-time analytics updates
      socketRef.current.on('analytics:update', (data: any) => {
        console.log('📊 Received analytics update event', data)
        queryClient.invalidateQueries({ queryKey: ['analytics-summary'] })
      })

      // Listen for Memory Resurfacing Notifications
      socketRef.current.on('memory:resurface', (data: any) => {
        console.log('🧠 [Memory Resurface]', data)
        const toast = document.createElement('div')
        toast.className =
          'fixed bottom-4 right-4 z-[9999] w-72 md:w-80 bg-(--bg-surface) border border-(--accent)/50 text-(--text-primary) p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 cursor-pointer overflow-hidden group hover:border-(--accent) transition-all'
        toast.innerHTML = `
          <div class="absolute top-0 left-0 w-1 h-full bg-(--accent)"></div>
          <div class="flex items-center gap-2 mb-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-(--accent)/10 text-(--accent) font-bold text-xs">🧠</span>
            <span class="font-manrope font-bold text-sm tracking-tight text-(--text-primary)">Memory Surfaced</span>
          </div>
          <div class="text-xs text-(--text-secondary) leading-relaxed mb-2">${data.message}</div>
          <div class="text-xs font-semibold text-(--accent) line-clamp-1 group-hover:underline">${data.item.title || data.item.url}</div>
        `
        toast.onclick = () => {
          toast.remove()
          window.location.href = '/items/' + data.item.id
        }
        document.body.appendChild(toast)

        // Dispatch to internal React system (like the bell icon)
        window.dispatchEvent(
          new CustomEvent('memory:notification', { detail: data }),
        )

        setTimeout(() => {
          if (document.body.contains(toast)) {
            toast.style.opacity = '0'
            toast.style.transform = 'translateY(10px)'
            setTimeout(() => toast.remove(), 300)
          }
        }, 8000)
      })
    }

    // Cleanup on unmount or user change
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user, queryClient])
}
