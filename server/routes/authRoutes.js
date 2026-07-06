import express from 'express';
import passport from 'passport';
import { githubCallback, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Step 1: Redirect to GitHub OAuth
router.get('/github', passport.authenticate('github', { session: false }));

// Step 2: GitHub redirects back here after user approves
router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/?error=auth_failed`,
  }),
  githubCallback
);

router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
