import express from 'express';
import {
  saveItem,
  getSavedItems,
  updateSavedItem,
  removeSavedItem,
} from '../controllers/savedItemsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, saveItem);
router.get('/', protect, getSavedItems);
router.patch('/:id', protect, updateSavedItem);
router.delete('/:id', protect, removeSavedItem);

export default router;
