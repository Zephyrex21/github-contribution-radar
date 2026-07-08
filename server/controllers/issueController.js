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

async function getSavedUrlSet(userId) {
  const saved = await SavedItem.find({ userId }).select('githubIssueUrl');
  return new Set(saved.map(s => s.githubIssueUrl));
}

/** Generic keyword search */
export async function searchIssues(req, res, next) {
  try {
    const { q = '', language, label, sort = 'score', page = 1 } = req.query;

    if (!q.trim()) {
      return res.json({ success: true, data: { items: [], totalCount: 0, page: 1, perPage: 50 } });
    }

    // Cache key is per-query only (not per-user) — public GitHub data is the same for everyone
    const cacheKey = `search:${q}:${language || ''}:${label || ''}:${sort}:${page}`;
    const cached = cache.get(cacheKey);

    const [userToken, userDoc, savedUrls] = await Promise.all([
      getUserToken(req.user.userId),
      User.findById(req.user.userId),
      getSavedUrlSet(req.user.userId),
    ]);

    const preferences = userDoc?.preferences || {};
    const githubSort = sort === 'score' ? 'updated' : sort;

    let items, totalCount;

    if (cached) {
      items = cached.items;
      totalCount = cached.totalCount;
    } else {
      const result = await githubService.searchIssues({
        q, language, label,
        sort: githubSort,
        page: Number(page),
        perPage: 50,
        userToken,
      });
      items      = result.items;
      totalCount = result.totalCount;
      cache.set(cacheKey, { items, totalCount });
    }

    // Score and mark saved status
    const scored = items.map(issue => {
      const partialRepo = { language: issue.language, updatedAt: issue.updatedAt, stars: 0 };
      const { score, scoreBand, difficultyTag } = calculateScore(issue, partialRepo, preferences);
      return { ...issue, score, scoreBand, difficultyTag, isSaved: savedUrls.has(issue.url) };
    });

    if (sort === 'score') scored.sort((a, b) => b.score - a.score);

    res.json({ success: true, data: { items: scored, totalCount, page: Number(page), perPage: 50 } });
  } catch (err) {
    next(err);
  }
}

/** Personalised "For You" — parallel search across ALL user languages */
export async function getForYou(req, res, next) {
  try {
    const { page = 1 } = req.query;

    const [userToken, userDoc, savedUrls] = await Promise.all([
      getUserToken(req.user.userId),
      User.findById(req.user.userId),
      getSavedUrlSet(req.user.userId),
    ]);

    const preferences = userDoc?.preferences || {};
    const languages   = preferences.languages || [];

    // Fix: [...languages] spread before .sort() so user preferences array is not mutated in-place
    const cacheKey = `foryou:${[...languages].sort().join(',')}:${page}`;
    const cached   = cache.get(cacheKey);

    let items;
    if (cached) {
      items = cached;
    } else {
      const result = await githubService.searchForYou({ languages, perPage: 50, page: Number(page), userToken });
      items = result.items;
      cache.set(cacheKey, items, 600); // 10 min TTL
    }

    const scored = items.map(issue => {
      const partialRepo = { language: issue.language, updatedAt: issue.updatedAt, stars: 0 };
      const { score, scoreBand, difficultyTag } = calculateScore(issue, partialRepo, preferences);
      return { ...issue, score, scoreBand, difficultyTag, isSaved: savedUrls.has(issue.url) };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json({ success: true, data: { items: scored, totalCount: scored.length, page: Number(page) } });
  } catch (err) {
    next(err);
  }
}

/** Trending — active repos with beginner-friendly issues */
export async function getTrending(req, res, next) {
  try {
    const { page = 1 } = req.query;
    const cacheKey = `trending:${page}`;
    const cached   = cache.get(cacheKey);

    const [userToken, userDoc, savedUrls] = await Promise.all([
      getUserToken(req.user.userId),
      User.findById(req.user.userId),
      getSavedUrlSet(req.user.userId),
    ]);

    const preferences = userDoc?.preferences || {};

    let items;
    if (cached) {
      items = cached;
    } else {
      const result = await githubService.searchTrending({ page: Number(page), perPage: 50, userToken });
      items = result.items;
      cache.set(cacheKey, items, 900); // 15 min TTL
    }

    const scored = items.map(issue => {
      const partialRepo = { language: issue.language, updatedAt: issue.updatedAt, stars: 500 };
      const { score, scoreBand, difficultyTag } = calculateScore(issue, partialRepo, preferences);
      return { ...issue, score, scoreBand, difficultyTag, isSaved: savedUrls.has(issue.url) };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json({ success: true, data: { items: scored, totalCount: scored.length, page: Number(page) } });
  } catch (err) {
    next(err);
  }
}

/** All open issues from a specific repo */
export async function getRepoIssues(req, res, next) {
  try {
    const { owner, repo } = req.params;
    const { page = 1 }   = req.query;
    const cacheKey = `repo-issues:${owner}:${repo}:${page}`;

    const [userToken, userDoc, savedUrls] = await Promise.all([
      getUserToken(req.user.userId),
      User.findById(req.user.userId),
      getSavedUrlSet(req.user.userId),
    ]);

    const preferences = userDoc?.preferences || {};

    let items, repoData;
    const cached = cache.get(cacheKey);
    if (cached) {
      items    = cached.items;
      repoData = cached.repoData;
    } else {
      const [issueResult, repoResult] = await Promise.all([
        githubService.getRepoIssues({ owner, repo, page: Number(page), perPage: 50, userToken }),
        githubService.getRepoDetail({ owner, repo, userToken }),
      ]);
      items    = issueResult.items;
      repoData = repoResult;
      cache.set(cacheKey, { items, repoData }, 300);
    }

    const scored = items.map(issue => {
      const { score, scoreBand, difficultyTag } = calculateScore(issue, repoData, preferences);
      return { ...issue, score, scoreBand, difficultyTag, isSaved: savedUrls.has(issue.url) };
    });

    res.json({ success: true, data: { items: scored, repo: repoData, totalCount: scored.length } });
  } catch (err) {
    next(err);
  }
}

/** Issue detail */
export async function getIssueDetail(req, res, next) {
  try {
    const { owner, repo, issueNumber } = req.params;
    const cacheKey = `issue:detail:${owner}:${repo}:${issueNumber}`;

    // Fix: removed a useless SavedItem.findOne() that was here previously —
    // it fired a real DB query only to return null immediately.
    // The actual saved-item check is done below after we have the issue URL.
    const [userToken, userDoc] = await Promise.all([
      getUserToken(req.user.userId),
      User.findById(req.user.userId),
    ]);

    let issueData = cache.get(cacheKey);
    if (!issueData) {
      const { issue, repo: repoData } = await githubService.getIssueDetail({ owner, repo, issueNumber, userToken });
      const { score, scoreBand, difficultyTag } = calculateScore(issue, repoData, userDoc?.preferences || {});
      const whatToDoNext = generateNextSteps(issue, repoData);
      issueData = { issue: { ...issue, score, scoreBand, difficultyTag }, repo: repoData, whatToDoNext };
      cache.set(cacheKey, issueData);
    }

    const saved = await SavedItem.findOne({
      userId: req.user.userId,
      githubIssueUrl: issueData.issue.url,
    });

    res.json({
      success: true,
      data: {
        ...issueData.issue,
        repo:         issueData.repo,
        whatToDoNext: issueData.whatToDoNext,
        isSaved:      !!saved,
        savedStatus:  saved?.status     || null,
        savedItemId:  saved?._id        || null,
        savedNote:    saved?.note       || '',
        verifiedPR:   saved?.verifiedPR || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── AI Issue Summarizer ─────────────────────────────────────────────────────
import { summarizeIssue } from '../services/geminiService.js';

/**
 * POST /api/issues/summarize
 *
 * Accepts issue metadata in the request body and returns an AI-generated
 * summary from Gemini 1.5 Flash.
 *
 * Results are cached by a hash of the issue URL to avoid burning API quota
 * on repeated requests for the same issue (30 min TTL).
 */
export async function summarizeIssueHandler(req, res, next) {
  try {
    const { title, bodyPreview, labels, repoFullName, language, issueUrl } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    // Cache key — scoped to the specific issue URL so results are globally reusable
    // across all users (the issue content is public GitHub data)
    const cacheKey = `ai-summary:${issueUrl || title}`;
    const cached   = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    const result = await summarizeIssue({
      title,
      bodyPreview,
      labels,
      repoFullName,
      language,
    });

    // Cache for 30 minutes — issues don't change often and this saves API quota
    cache.set(cacheKey, result, 1800);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
