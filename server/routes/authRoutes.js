import express from 'express';
import {
  register, registerValidation,
  login,    loginValidation,
  getMe,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login',    loginValidation,    login);
router.post('/logout',   logout);
router.get ('/me',       protect, getMe);

export default router;
