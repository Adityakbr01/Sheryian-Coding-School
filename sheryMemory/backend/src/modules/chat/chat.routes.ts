import { Router } from 'express'
import { ChatController } from './chat.controller'
import { authMiddleware } from "../../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get('/sessions', ChatController.getSessions)
router.post('/sessions', ChatController.createSession)
router.get('/sessions/:id/messages', ChatController.getSessionMessages)
router.post('/sessions/:id/messages', ChatController.sendMessage)
router.post('/sessions/:id/stream', ChatController.streamMessage)
router.delete('/sessions/:id', ChatController.deleteSession)

export default router
