import { Server as SocketIOServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { logger } from '../utils/logger'

let io: SocketIOServer

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    logger.info(`[Socket] 🔌 Connected: ${socket.id}`)

    socket.on('join_user_room', (userId: string) => {
      socket.join(userId)
      logger.info(
        `[Socket] 🔌 Socket ${socket.id} joined standard user room: ${userId}`,
      )
    })

    socket.on('disconnect', () => {
      logger.info(`[Socket] 🔌 Disconnected: ${socket.id}`)
    })
  })

  return io
}

export function getIo() {
  if (!io) {
    throw new Error('Socket.io has not been booted yet')
  }
  return io
}
