import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { getDueItems, markReviewed } from './memory.controller'

const router = Router()

router.use(authMiddleware)

router.get('/due', getDueItems)
router.post('/:itemId/review', markReviewed)

export default router
