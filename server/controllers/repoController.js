import { cache } from '../config/cache.js';
import * as githubService from '../services/githubService.js';
import User from '../models/User.js';

async function getUserToken(userId) {
  const user = await User.findById(userId).select('+githubAccessToken');
  return user?.githubAccessToken;
}

export async function searchRepos(req, res, next) {
  try {
    const { q = '', language, page = 1 } = req.query;

    if (!q.trim()) {
      return res.json({ success: true, data: { items: [], totalCount: 0, page: 1, perPage: 20 } });
    }

    const cacheKey = `repos:${q}:${language}:${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, fromCache: true });

    const userToken = await getUserToken(req.user.userId);
    const result = await githubService.searchRepos({ q, language, page: Number(page), userToken });

    cache.set(cacheKey, result);
    res.json({ success: true, data: { ...result, page: Number(page), perPage: 20 } });
  } catch (err) {
    next(err);
  }
}
