import { Router } from 'express';
import { authController } from './auth.controller.ts';
import { authenticate } from '../../middlewares/custom/auth.middleware.ts';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
