import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function generateToken(user) {
  return jwt.sign(
    { userId: user._id, username: user.username, avatarUrl: user.avatarUrl },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

export async function githubCallback(req, res) {
  try {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/?error=auth_failed`);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-githubAccessToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  // JWT is stateless — client just deletes the token
  res.json({ success: true, message: 'Logged out' });
}
