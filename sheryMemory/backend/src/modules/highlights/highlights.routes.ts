import { Router } from 'express'
import { createHighlight, getAllHighlights, getItemHighlights, deleteHighlight, clearItemHighlights } from './highlights.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.post('/', createHighlight)
router.get('/', getAllHighlights)                    // GET /api/highlights?color=#fef08a
router.get('/item/:itemId', getItemHighlights)       // GET /api/highlights/item/:itemId
router.delete('/item/:itemId', clearItemHighlights)  // DELETE /api/highlights/item/:itemId (clear all)
router.delete('/:id', deleteHighlight)               // DELETE /api/highlights/:id

export default router
