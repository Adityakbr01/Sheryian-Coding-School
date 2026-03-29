import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'
import { logger } from './utils/logger'
import { initSocket } from './socket/socket'

// Routes
import authRoutes from './modules/auth/auth.routes'
import itemsRoutes from './modules/items/items.routes'
import searchRoutes from './modules/search/search.routes'
import collectionsRoutes from './modules/collections/collections.routes'
import highlightsRoutes from './modules/highlights/highlights.routes'
import memoryRoutes from './modules/memory/memory.routes'
import graphRoutes from './modules/graph/graph.routes'
import chatRoutes from './modules/chat/chat.routes'
import {
  globalErrorHandler,
  notFoundHandler,
} from './middleware/error.middleware'
import { env } from './config/env'

// Background Workers — importing starts them automatically
import './workers/items.worker'
import './workers/reminder.worker'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// HTTP Logging using Morgan & Winston
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev'
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/highlights', highlightsRoutes)
app.use('/api/memory', memoryRoutes)
app.use('/api/graph', graphRoutes)
app.use('/api/chat', chatRoutes)

// Error Handling Middleware (must be registered last)
app.use(notFoundHandler)
app.use(globalErrorHandler)

const PORT = env.PORT

const httpServer = http.createServer(app)
initSocket(httpServer)

httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${env.NODE_ENV} mode`)
  logger.info(`Background worker is running in the same process`) //Todo fix that in Production
})
