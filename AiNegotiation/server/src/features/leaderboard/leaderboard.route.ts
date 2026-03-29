import { Router } from 'express';
import { leaderboardController } from './leaderboard.controller.ts';
import { authenticate } from '../../middlewares/custom/auth.middleware.ts';

const router = Router();

router.get('/', leaderboardController.getGlobal);
router.get('/best-deals', leaderboardController.getBestDeals);
router.get('/me', authenticate, leaderboardController.getMyRank);

export default router;

