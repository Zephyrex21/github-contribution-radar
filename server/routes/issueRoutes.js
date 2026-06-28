import express from 'express';
import {
  searchIssues,
  getForYou,
  getTrending,
  getRepoIssues,
  getIssueDetail,
} from '../controllers/issueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search',             protect, searchIssues);   // keyword search
router.get('/foryou',             protect, getForYou);      // personalised feed
router.get('/trending',           protect, getTrending);    // trending issues
router.get('/repo/:owner/:repo',  protect, getRepoIssues);  // all issues from a repo
router.get('/:owner/:repo/:issueNumber', protect, getIssueDetail); // single issue

export default router;
