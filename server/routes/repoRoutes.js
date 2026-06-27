import express from 'express';
import { searchRepos } from '../controllers/repoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchRepos);

export default router;
