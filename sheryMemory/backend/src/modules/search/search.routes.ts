import { Router } from 'express'
import * as SearchController from './search.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

// All search routes require authentication
router.use(authMiddleware)

router.get('/', SearchController.searchItems)


export default router
