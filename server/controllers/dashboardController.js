import SavedItem from '../models/SavedItem.js';

export async function getSummary(req, res, next) {
  try {
    const userId = req.user.userId;
    const allItems = await SavedItem.find({ userId }).sort({ updatedAt: -1 });

    const statusCounts = { Saved:0, Exploring:0, 'In Progress':0, 'PR Opened':0, Merged:0, Dropped:0 };
    for (const item of allItems) {
      if (statusCounts[item.status] !== undefined) statusCounts[item.status]++;
    }

    res.json({
      success: true,
      data: {
        totalSaved:     allItems.length,
        active:         allItems.filter(i => ['Exploring','In Progress','PR Opened'].includes(i.status)).length,
        merged:         statusCounts.Merged,
        dropped:        statusCounts.Dropped,
        byStatus:       statusCounts,
        recentActivity: allItems.slice(0, 5),
      },
    });
  } catch (err) { next(err); }
}

export async function getHeatmap(req, res, next) {
  try {
    const userId = req.user.userId;
    const since = new Date();
    since.setDate(since.getDate() - 181);

    const items = await SavedItem.find({
      userId,
      $or: [{ savedAt: { $gte: since } }, { updatedAt: { $gte: since } }],
    }).select('savedAt updatedAt');

    // Count actions per day
    const dayMap = {};
    for (const item of items) {
      [item.savedAt, item.updatedAt].forEach(d => {
        if (d >= since) {
          const key = new Date(d).toISOString().split('T')[0];
          dayMap[key] = (dayMap[key] || 0) + 1;
        }
      });
    }

    // Build array for last 181 days
    const heatmap = [];
    for (let i = 180; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      heatmap.push({ date: key, count: dayMap[key] || 0 });
    }

    // Calculate streak (consecutive days with activity ending today)
    let streak = 0;
    for (let i = heatmap.length - 1; i >= 0; i--) {
      if (heatmap[i].count > 0) streak++;
      else if (i < heatmap.length - 1) break; // gap found
    }

    res.json({ success: true, data: { heatmap, streak } });
  } catch (err) { next(err); }
}

export async function getActivity(req, res, next) {
  try {
    const items = await SavedItem.find({ userId: req.user.userId }).sort({ updatedAt: -1 }).limit(20);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}
