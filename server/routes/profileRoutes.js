import express from 'express';
import { getProfile, updatePreferences, updateGithubConnection } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get ('/',          protect, getProfile);
router.patch('/preferences', protect, updatePreferences);
router.patch('/github',   protect, updateGithubConnection);
export default router;
