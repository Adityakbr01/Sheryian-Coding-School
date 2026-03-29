import { Router } from 'express';
import { negotiateController } from './negotiate.controller.ts';
import { authenticate } from '../../middlewares/custom/auth.middleware.ts';

const router = Router();

router.post('/', authenticate, negotiateController.negotiate);
router.post('/:sessionId/accept', authenticate, negotiateController.acceptDeal);

export default router;

