import { Router } from 'express'
import * as HighlightsController from './highlights.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.post('/', HighlightsController.createHighlight)
router.get('/', HighlightsController.getAllHighlights)
router.get('/item/:itemId', HighlightsController.getItemHighlights)
router.delete('/item/:itemId', HighlightsController.clearItemHighlights)
router.delete('/:id', HighlightsController.deleteHighlight)


export default router
