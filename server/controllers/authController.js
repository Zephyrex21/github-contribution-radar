import jwt        from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User       from '../models/User.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── Validation chains (reusable middleware arrays) ────────────────────────────

export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * Body: { username, email, password }
 */
export async function register(req, res, next) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors:  errors.array(),
      });
    }

    const { username, email, password } = req.body;

    // Check uniqueness
    const existingEmail    = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ success: false, message: 'Email already registered' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(409).json({ success: false, message: 'Username already taken' });

    // Create user — password is hashed in the pre-save hook
    const user = await User.create({ username, email, password });

    const token = generateToken(user);
    res.status(201).json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Find user with password (select:false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /auth/me  (protected)
 * Returns the full user document for the authenticated user.
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-password -githubToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/logout
 * JWT is stateless — client just deletes the token.
 */
export function logout(req, res) {
  res.json({ success: true, message: 'Logged out' });
}
