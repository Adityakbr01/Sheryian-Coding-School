import { Router } from 'express';
import { sessionController } from './session.controller.ts';
import { authenticate } from '../../middlewares/custom/auth.middleware.ts';

const router = Router();

router.get('/products', sessionController.listProducts);
router.post('/start', authenticate, sessionController.startSession);
router.get('/my', authenticate, sessionController.getUserSessions);
router.get('/:sessionId', authenticate, sessionController.getSession);

export default router;

