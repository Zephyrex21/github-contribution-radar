import express from 'express';
import { getProfile, updatePreferences } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getProfile);
router.patch('/preferences', protect, updatePreferences);

export default router;
