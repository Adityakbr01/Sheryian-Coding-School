import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { createHighlight, getHighlights, deleteHighlight } from './highlights.controller'

const router = Router()

router.use(authMiddleware)

router.post('/', createHighlight)
router.get('/', getHighlights)
router.delete('/:id', deleteHighlight)

export default router
