import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
console.log('⚙️ [Socket Debug] Target URL calculated as:', SOCKET_URL);

export function useSocket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (socketRef.current) {
         socketRef.current.disconnect();
         socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
       console.log('🔄 [Socket Debug] Booting io() connection for user:', user.id);
       socketRef.current = io(SOCKET_URL, {
          transports: ['websocket', 'polling']
       });
       
       socketRef.current.on('connect', () => {
         console.log('🟢 [Socket Debug] Handshake successful! Socket ID:', socketRef.current?.id);
         socketRef.current?.emit('join_user_room', user.id);
         console.log('🚪 [Socket Debug] Requested to join room:', user.id);
       });

       socketRef.current.on('connect_error', (error) => {
         console.error('🔴 [Socket Debug] Connection Failed:', error.message);
       });

       // Listen for Queue / Worker completion event
       socketRef.current.on('item_processed', (data: { itemId: string }) => {
         console.log('📡 Received item_processed event for ID:', data.itemId);
         
         // Invalidate items lists to fresh Grid
         queryClient.invalidateQueries({ queryKey: ['items'] });
         
         // Invalidate specific item Detail Pages
         queryClient.invalidateQueries({ queryKey: ['item', data.itemId] });
       });
    }

    // Cleanup on unmount or user change
    return () => {
       if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
       }
    };
  }, [user, queryClient]);
}
