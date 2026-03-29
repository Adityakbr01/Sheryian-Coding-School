import { Router } from 'express'
import multer from 'multer'
import * as ItemsController from './items.controller'
import { validate } from '../../middleware/validate.middleware'
import { authMiddleware } from '../../middleware/auth.middleware'
import { saveItemSchema } from './items.schema'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.use(authMiddleware)

router.post('/', upload.single('file'), validate(saveItemSchema), ItemsController.save)
router.get('/', ItemsController.list)
router.get('/search', ItemsController.search)
router.get('/:id', ItemsController.getById)
router.delete('/:id', ItemsController.remove)


export default router
