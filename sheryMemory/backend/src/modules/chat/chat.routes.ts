import { Router } from 'express'
import * as ChatController from './chat.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.get('/sessions', authMiddleware, ChatController.getSessions)
router.post('/sessions', authMiddleware, ChatController.createSession)
router.get('/sessions/:id/messages', authMiddleware, ChatController.getSessionMessages)
router.post('/sessions/:id/messages', authMiddleware, ChatController.sendMessage)
router.post('/sessions/:id/stream', authMiddleware, ChatController.streamMessage)
router.delete('/sessions/:id', authMiddleware, ChatController.deleteSession)



export default router
