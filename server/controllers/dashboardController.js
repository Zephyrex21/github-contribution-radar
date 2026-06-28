import SavedItem from '../models/SavedItem.js';

export async function getSummary(req, res, next) {
  try {
    const userId  = req.user.userId;
    const allItems = await SavedItem.find({ userId }).sort({ updatedAt: -1 });

    const statusCounts = { Saved:0, Exploring:0, 'In Progress':0, 'PR Opened':0, Merged:0, Dropped:0 };
    for (const item of allItems) {
      if (statusCounts[item.status] !== undefined) statusCounts[item.status]++;
    }

    // Language breakdown
    const langMap = {};
    for (const item of allItems) {
      if (item.language) langMap[item.language] = (langMap[item.language] || 0) + 1;
    }
    const languageBreakdown = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([lang, count]) => ({ lang, count }));

    // This-week count (for trend arrows)
    const weekAgo  = new Date(Date.now() - 7 * 86400000);
    const thisWeek = allItems.filter(i => new Date(i.savedAt) >= weekAgo).length;

    const active = allItems.filter(i => ['Exploring','In Progress','PR Opened'].includes(i.status)).length;
    const total  = allItems.length > 0
      ? Math.round(((statusCounts.Merged) / allItems.length) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalSaved:        allItems.length,
        active,
        merged:            statusCounts.Merged,
        dropped:           statusCounts.Dropped,
        successRate:       total,
        thisWeekSaved:     thisWeek,
        byStatus:          statusCounts,
        languageBreakdown,
        recentActivity:    allItems.slice(0, 8),
      },
    });
  } catch (err) { next(err); }
}

export async function getHeatmap(req, res, next) {
  try {
    const userId = req.user.userId;
    const since  = new Date();
    since.setDate(since.getDate() - 181);

    const items = await SavedItem.find({
      userId,
      $or: [{ savedAt: { $gte: since } }, { updatedAt: { $gte: since } }],
    }).select('savedAt updatedAt status');

    // Count ONE action per item per day (avoid double-counting savedAt+updatedAt)
    // Rule: if savedAt and updatedAt are on the SAME day, count as 1.
    const dayMap = {};
    for (const item of items) {
      const saveDay   = new Date(item.savedAt).toISOString().split('T')[0];
      const updateDay = new Date(item.updatedAt).toISOString().split('T')[0];

      if (new Date(item.savedAt) >= since) {
        dayMap[saveDay] = (dayMap[saveDay] || 0) + 1;
      }
      // Only count updatedAt separately if it's a DIFFERENT day from savedAt
      if (updateDay !== saveDay && new Date(item.updatedAt) >= since) {
        dayMap[updateDay] = (dayMap[updateDay] || 0) + 1;
      }
    }

    // Build 181-day array
    const heatmap = [];
    for (let i = 180; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      heatmap.push({ date: key, count: dayMap[key] || 0 });
    }

    // Streak: consecutive days with activity, ending today
    let streak = 0;
    for (let i = heatmap.length - 1; i >= 0; i--) {
      if (heatmap[i].count > 0) streak++;
      else if (i < heatmap.length - 1) break;
    }

    res.json({ success: true, data: { heatmap, streak } });
  } catch (err) { next(err); }
}

export async function getActivity(req, res, next) {
  try {
    const items = await SavedItem.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}
