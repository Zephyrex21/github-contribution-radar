import express  from 'express';
import passport from 'passport';
import { githubCallback, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /auth/github
 *
 * Redirects to GitHub's OAuth page.
 *
 * When ?force_login=true is passed (which Landing.jsx always does), GitHub
 * ignores any existing browser session and shows the login/account screen —
 * letting the user pick a different account instead of being silently locked
 * into whichever GitHub account is currently active in the browser.
 *
 * `force_login` is an official GitHub OAuth parameter:
 * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
 */
router.get('/github', (req, res, next) => {
  const opts = {
    session: false,
    scope:   ['user:email'],
  };

  // Forward force_login to GitHub if the client requested it
  if (req.query.force_login === 'true') {
    opts.force_login = true;
  }

  passport.authenticate('github', opts)(req, res, next);
});

/**
 * GET /auth/github/callback
 * GitHub redirects here after the user authorises the app.
 */
router.get(
  '/github/callback',
  passport.authenticate('github', {
    session:         false,
    failureRedirect: `${process.env.CLIENT_URL}/?error=auth_failed`,
  }),
  githubCallback
);

router.post('/logout', logout);
router.get ('/me',     protect, getMe);

export default router;
