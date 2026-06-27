import { cache } from '../config/cache.js';
import * as githubService from '../services/githubService.js';
import { calculateScore } from '../services/scoringService.js';
import { generateNextSteps } from '../utils/nextStepsGenerator.js';
import User from '../models/User.js';
import SavedItem from '../models/SavedItem.js';

async function getUserToken(userId) {
  const user = await User.findById(userId).select('+githubAccessToken');
  return user?.githubAccessToken;
}

export async function searchIssues(req, res, next) {
  try {
    const { q = '', language, label, sort = 'score', page = 1 } = req.query;

    if (!q.trim()) {
      return res.json({ success: true, data: { items: [], totalCount: 0, page: 1, perPage: 20 } });
    }

    const cacheKey = `issues:${q}:${language}:${label}:${sort}:${page}:${req.user.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, fromCache: true });

    const [userToken, userDoc] = await Promise.all([
      getUserToken(req.user.userId),
      User.findById(req.user.userId),
    ]);

    const preferences = userDoc?.preferences || {};
    const githubSort = sort === 'score' ? 'updated' : sort;

    const result = await githubService.searchIssues({
      q,
      language,
      label,
      sort: githubSort,
      page: Number(page),
      userToken,
    });

    // Score each issue
    const scoredItems = result.items.map((issue) => {
      const partialRepo = { language: issue.language, updatedAt: issue.updatedAt, stars: 0 };
      const { score, scoreBand, difficultyTag } = calculateScore(issue, partialRepo, preferences);
      return { ...issue, score, scoreBand, difficultyTag };
    });

    // Sort by score if requested
    if (sort === 'score') scoredItems.sort((a, b) => b.score - a.score);

    // Mark which issues the user has already saved
    const savedItems = await SavedItem.find({ userId: req.user.userId }).select('githubIssueUrl');
    const savedUrls = new Set(savedItems.map((s) => s.githubIssueUrl));

    const items = scoredItems.map((issue) => ({
      ...issue,
      isSaved: savedUrls.has(issue.url),
    }));

    const responseData = { items, totalCount: result.totalCount, page: Number(page), perPage: 20 };
    cache.set(cacheKey, responseData);

    res.json({ success: true, data: responseData });
  } catch (err) {
    next(err);
  }
}

export async function getIssueDetail(req, res, next) {
  try {
    const { owner, repo, issueNumber } = req.params;
    const cacheKey = `issue:detail:${owner}:${repo}:${issueNumber}`;

    const [userToken, userDoc] = await Promise.all([
      getUserToken(req.user.userId),
      User.findById(req.user.userId),
    ]);

    let issueData = cache.get(cacheKey);

    if (!issueData) {
      const { issue, repo: repoData } = await githubService.getIssueDetail({
        owner,
        repo,
        issueNumber,
        userToken,
      });
      const { score, scoreBand, difficultyTag } = calculateScore(
        issue,
        repoData,
        userDoc?.preferences || {}
      );
      const whatToDoNext = generateNextSteps(issue, repoData);
      issueData = { issue: { ...issue, score, scoreBand, difficultyTag }, repo: repoData, whatToDoNext };
      cache.set(cacheKey, issueData);
    }

    // Check if the current user has saved this issue
    const savedItem = await SavedItem.findOne({
      userId: req.user.userId,
      githubIssueUrl: issueData.issue.url,
    });

    res.json({
      success: true,
      data: {
        ...issueData.issue,
        repo: issueData.repo,
        whatToDoNext: issueData.whatToDoNext,
        isSaved: !!savedItem,
        savedStatus: savedItem?.status || null,
        savedItemId: savedItem?._id || null,
      },
    });
  } catch (err) {
    next(err);
  }
}
