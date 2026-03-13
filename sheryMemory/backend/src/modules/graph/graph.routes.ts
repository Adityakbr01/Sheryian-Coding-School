import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { getGraph } from './graph.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', getGraph)

export default router
