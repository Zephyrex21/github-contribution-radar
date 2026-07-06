import User from '../models/User.js';

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-githubAccessToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const { languages, frameworks, difficultyPreference, interests } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        preferences: { languages, frameworks, difficultyPreference, interests },
        onboardingComplete: true,
      },
      { new: true }
    ).select('-githubAccessToken');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
