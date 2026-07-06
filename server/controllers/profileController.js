import User from '../models/User.js';

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-password -githubToken');
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
      { preferences: { languages, frameworks, difficultyPreference, interests }, onboardingComplete: true },
      { new: true }
    ).select('-password -githubToken');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/profile/github
 * Lets users optionally connect their GitHub username + PAT so PR
 * verification still works without OAuth.
 */
export async function updateGithubConnection(req, res, next) {
  try {
    const { githubUsername, githubToken } = req.body;
    const update = {};
    if (githubUsername !== undefined) update.githubUsername = githubUsername.trim();
    if (githubToken    !== undefined) update.githubToken    = githubToken.trim();

    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true })
      .select('-password -githubToken');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
