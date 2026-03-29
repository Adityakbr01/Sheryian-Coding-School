import { Router } from 'express';
import { analyticsController } from './analytics.controller.ts';
import { authenticate } from '../../middlewares/custom/auth.middleware.ts';

const router = Router();

router.get('/summary', analyticsController.getSummary);
router.get('/tactics', analyticsController.getTacticStats);
router.get('/moods', analyticsController.getMoodDistribution);
router.get('/difficulty', analyticsController.getDifficultyStats);
router.post('/run-job', authenticate, analyticsController.runAnalyticsJob);

export default router;

