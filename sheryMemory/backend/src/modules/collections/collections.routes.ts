import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import {
    createCollection,
    getCollections,
    getCollection,
    updateCollection,
    deleteCollection,
    addItemToCollection,
    removeItemFromCollection
} from './collections.controller'

const router = Router()

router.use(authMiddleware)

router.post('/', createCollection)
router.get('/', getCollections)
router.get('/:id', getCollection)
router.patch('/:id', updateCollection)
router.delete('/:id', deleteCollection)
router.post('/:id/items', addItemToCollection)
router.delete('/:id/items/:itemId', removeItemFromCollection)

export default router
