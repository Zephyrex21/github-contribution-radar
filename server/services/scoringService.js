/**
 * Rules-based scoring service — no ML.
 * Returns a match quality score (0–100), a scoreBand, and a difficultyTag.
 */
export function calculateScore(issue, repo = {}, userPreferences = {}) {
  let score = 50; // start neutral

  const labels = (issue.labels || []).map((l) => l.toLowerCase());
  const { languages = [], difficultyPreference = 'beginner' } = userPreferences;

  // Label bonuses
  if (labels.includes('good first issue')) score += 30;
  if (labels.includes('help wanted')) score += 10;

  // Language match with user preferences
  if (repo.language && languages.includes(repo.language)) score += 20;

  // Repo activity: updated in last 30 days
  const repoAgeDays = (Date.now() - new Date(repo.updatedAt || 0)) / 86400000;
  if (repoAgeDays <= 30) score += 15;

  // Moderate popularity (not too unknown, not too huge)
  const stars = repo.stars || 0;
  if (stars >= 100 && stars <= 10000) score += 10;

  // Difficulty preference alignment
  const hasBeginnerLabel =
    labels.includes('good first issue') ||
    labels.includes('beginner') ||
    labels.includes('easy');
  const hasAdvancedLabel =
    labels.includes('advanced') || labels.includes('expert');

  if (difficultyPreference === 'beginner' && hasBeginnerLabel) score += 10;
  if (difficultyPreference === 'advanced' && hasAdvancedLabel) score += 10;

  // Staleness penalty: issue not updated in 90+ days
  const issueAgeDays = (Date.now() - new Date(issue.updatedAt || 0)) / 86400000;
  if (issueAgeDays >= 90) score -= 20;

  // Closed issue penalty
  if (issue.state === 'closed') score -= 30;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Score band
  let scoreBand;
  if (score >= 80) scoreBand = 'Strong Match';
  else if (score >= 50) scoreBand = 'Possible Match';
  else scoreBand = 'Low Match';

  // Difficulty tag (from labels, not score)
  let difficultyTag = 'Advanced';
  if (
    labels.includes('good first issue') ||
    labels.includes('beginner') ||
    labels.includes('easy')
  ) {
    difficultyTag = 'Beginner';
  } else if (labels.includes('intermediate') || labels.includes('medium')) {
    difficultyTag = 'Moderate';
  }

  return { score, scoreBand, difficultyTag };
}
