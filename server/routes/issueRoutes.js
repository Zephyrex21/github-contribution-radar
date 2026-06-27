import express from 'express';
import { searchIssues, getIssueDetail } from '../controllers/issueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchIssues);
router.get('/:owner/:repo/:issueNumber', protect, getIssueDetail);

export default router;
