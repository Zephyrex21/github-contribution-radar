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
