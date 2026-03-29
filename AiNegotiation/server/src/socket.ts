import { Server as SocketIOServer, Socket } from 'socket.io'
import { logger } from './services/loggerService.ts'

export let io: SocketIOServer | null = null

export const initializeSocket = (server: import('http').Server, corsOptions: any) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: corsOptions.origin ?? '*',
            credentials: true,
        },
    })

    io.on('connection', (socket: Socket) => {
        logger.info('🟢 Socket connected', { socketId: socket.id })

        socket.on('join_user_room', (userId: string) => {
            socket.join(`user:${userId}`)
            logger.info('🚪 Joined user room', { userId, socketId: socket.id })
        })

        socket.on('disconnect', (reason: string) => {
            logger.info('🔴 Socket disconnected', { socketId: socket.id, reason })
        })
    })

    return io
}
