import express from 'express';
import {
  searchIssues,
  getForYou,
  getTrending,
  getRepoIssues,
  getIssueDetail,
  summarizeIssueHandler,
} from '../controllers/issueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search',                   protect, searchIssues);
router.get('/foryou',                   protect, getForYou);
router.get('/trending',                 protect, getTrending);
router.get('/repo/:owner/:repo',        protect, getRepoIssues);

// AI summarizer — POST because it accepts issue data in the body
// (issue body can be long, not suitable for a query param)
router.post('/summarize',               protect, summarizeIssueHandler);

// Must be last — catches /:owner/:repo/:issueNumber
router.get('/:owner/:repo/:issueNumber', protect, getIssueDetail);

export default router;
