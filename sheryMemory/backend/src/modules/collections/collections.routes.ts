import { Router } from 'express'
import * as CollectionsController from './collections.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.post('/', CollectionsController.createCollection)
router.get('/', CollectionsController.getCollections)
router.get('/:id', CollectionsController.getCollection)
router.patch('/:id', CollectionsController.updateCollection)
router.delete('/:id', CollectionsController.deleteCollection)
router.post('/:id/items', CollectionsController.addItemToCollection)
router.delete('/:id/items/:itemId', CollectionsController.removeItemFromCollection)

export default router
