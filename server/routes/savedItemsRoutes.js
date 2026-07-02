import express from 'express';
import {
  saveItem,
  getSavedItems,
  updateSavedItem,
  removeSavedItem,
  verifyPR,
} from '../controllers/savedItemsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',               protect, saveItem);
router.get('/',                protect, getSavedItems);
router.patch('/:id',           protect, updateSavedItem);
router.delete('/:id',          protect, removeSavedItem);

// PR Verification — POST because it writes verifiedPR to the SavedItem in DB
router.post('/:id/verify-pr',  protect, verifyPR);

export default router;
