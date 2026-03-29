import { Router } from 'express'
import * as GraphController from './graph.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', GraphController.getGraph)
router.get('/related/:itemId', GraphController.getRelatedItems)
router.post('/sync', GraphController.syncGraph)


export default router
