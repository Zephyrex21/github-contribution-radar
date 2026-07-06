import SavedItem from '../models/SavedItem.js';
import Issue from '../models/Issue.js';

export async function saveItem(req, res, next) {
  try {
    const { githubIssueId, issueTitle, repoFullName, githubIssueUrl, difficultyTag, language, score } =
      req.body;

    if (!githubIssueId || !githubIssueUrl) {
      return res
        .status(400)
        .json({ success: false, message: 'githubIssueId and githubIssueUrl are required' });
    }

    // Upsert the Issue document so we have a local reference
    let issueDoc = await Issue.findOne({ githubIssueId });
    if (!issueDoc) {
      issueDoc = await Issue.create({
        githubIssueId,
        title: issueTitle,
        repoFullName,
        url: githubIssueUrl,
        difficultyTag,
        language,
        score,
        state: 'open',
      });
    }

    const saved = await SavedItem.create({
      userId: req.user.userId,
      issueId: issueDoc._id,
      githubIssueUrl,
      issueTitle,
      repoFullName,
      difficultyTag,
      language,
      score,
    });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Issue already saved' });
    }
    next(err);
  }
}

export async function getSavedItems(req, res, next) {
  try {
    const { status, page = 1 } = req.query;
    const filter = { userId: req.user.userId };
    if (status) filter.status = status;

    const total = await SavedItem.countDocuments(filter);
    const items = await SavedItem.find(filter)
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * 20)
      .limit(20)
      .populate('issueId');

    res.json({ success: true, data: { items, total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
}

export async function updateSavedItem(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const item = await SavedItem.findOne({ _id: id, userId: req.user.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Saved item not found' });

    if (status !== undefined) item.status = status;
    if (note !== undefined) item.note = note;
    item.updatedAt = new Date();
    await item.save();

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function removeSavedItem(req, res, next) {
  try {
    const { id } = req.params;
    const item = await SavedItem.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Saved item not found' });
    res.json({ success: true, message: 'Removed' });
  } catch (err) {
    next(err);
  }
}

// ─── PR Verification ────────────────────────────────────────────────────────
import User from '../models/User.js';
import * as githubService from '../services/githubService.js';

/**
 * POST /api/saved-items/:id/verify-pr
 *
 * Checks GitHub for a PR opened by this user that references the saved issue.
 * Stores the result on SavedItem.verifiedPR and optionally auto-advances the
 * status (e.g. "PR Opened" → "Merged" when GitHub confirms the PR was merged).
 */
export async function verifyPR(req, res, next) {
  try {
    const { id } = req.params;

    // Fetch the saved item — must belong to this user
    const savedItem = await SavedItem.findOne({ _id: id, userId: req.user.userId });
    if (!savedItem) {
      return res.status(404).json({ success: false, message: 'Saved item not found' });
    }

    // Parse owner / repo / issueNumber from the stored GitHub issue URL
    // Expected format: https://github.com/{owner}/{repo}/issues/{number}
    const urlMatch = savedItem.githubIssueUrl?.match(
      /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/
    );
    if (!urlMatch) {
      return res.status(400).json({ success: false, message: 'Cannot parse issue URL' });
    }
    const [, owner, repo, issueNumber] = urlMatch;

    // Now uses the optional GitHub PAT the user added in Profile settings
    // rather than OAuth token (since we switched to email/password auth)
    const userDoc = await User.findById(req.user.userId).select('+githubToken githubUsername username');
    
    const effectiveUsername = userDoc?.githubUsername || userDoc?.username;
    const effectiveToken    = userDoc?.githubToken    || process.env.GITHUB_API_TOKEN || '';

    if (!effectiveUsername) {
      return res.status(400).json({
        success: false,
        message: 'Add your GitHub username in Profile → GitHub Connection so we know which PRs to check.',
      });
    }

    // Run the verification against GitHub's API
    const result = await githubService.verifyUserPR({
      owner,
      repo,
      issueNumber,
      username:  effectiveUsername,
      userToken: effectiveToken,
    });

    let statusChanged = false;

    if (result.verified) {
      // Persist the PR data on the saved item
      savedItem.verifiedPR = {
        url:        result.prUrl,
        title:      result.prTitle,
        number:     result.prNumber,
        state:      result.prState,
        verifiedAt: new Date(),
      };

      // Auto-advance status based on the PR's state, but never move backwards
      const currentStatus = savedItem.status;

      if (result.prState === 'merged' && currentStatus !== 'Merged') {
        savedItem.status = 'Merged';
        statusChanged = true;
      } else if (
        result.prState === 'open' &&
        !['PR Opened', 'Merged'].includes(currentStatus)
      ) {
        savedItem.status = 'PR Opened';
        statusChanged = true;
      }

      await savedItem.save(); // pre-save hook updates updatedAt automatically
    }

    res.json({
      success: true,
      data: {
        verified:      result.verified,
        prUrl:         result.prUrl     || null,
        prTitle:       result.prTitle   || null,
        prNumber:      result.prNumber  || null,
        prState:       result.prState   || null,
        statusChanged,
        newStatus:     savedItem.status,
      },
    });
  } catch (err) {
    next(err);
  }
}
