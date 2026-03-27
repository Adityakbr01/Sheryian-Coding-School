import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { getGraph, syncGraph, getRelatedItems } from './graph.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', getGraph)
router.get('/related/:itemId', getRelatedItems)  // GET /api/graph/related/:itemId?limit=5
router.post('/sync', syncGraph)

export default router
