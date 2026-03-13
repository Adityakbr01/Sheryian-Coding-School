import { Router } from 'express'
import { ItemsController } from './items.controller'
import { validate } from '../../middleware/validate.middleware'
import { authMiddleware } from '../../middleware/auth.middleware'
import { saveItemSchema } from './items.schema'

const router = Router()

// Protect all item routes
router.use(authMiddleware)

router.post('/', validate(saveItemSchema), ItemsController.save)
router.get('/', ItemsController.list)
router.delete('/:id', ItemsController.remove)

export default router
