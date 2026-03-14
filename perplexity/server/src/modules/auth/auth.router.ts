import { Router } from 'express';
import passport from 'passport';
import { AuthController } from 'modules/auth/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Google Auth Route
router.get(
  '/google',
  (req, res, next) => {
    const redirectUrl = req.query.redirectUrl as string;
    const state = redirectUrl
      ? Buffer.from(JSON.stringify({ redirectUrl })).toString('base64')
      : undefined;

    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state,
      session: false
    })(req, res, next);
  }
);

// Google Auth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.googleCallback
);

export default router;
