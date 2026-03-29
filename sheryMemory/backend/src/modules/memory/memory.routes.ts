import { Router } from 'express'
import * as MemoryController from './memory.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/due', MemoryController.getDueItems)
router.get('/resurface', MemoryController.getResurfacedItems)
router.post('/:itemId/review', MemoryController.markReviewed)


export default router
