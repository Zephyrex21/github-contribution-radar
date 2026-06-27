import express from 'express';
import { getSummary, getHeatmap, getActivity } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/summary',  protect, getSummary);
router.get('/heatmap',  protect, getHeatmap);
router.get('/activity', protect, getActivity);
export default router;
