// Bug fix: low-score badge used bg-white/[0.06] which is invisible in light mode
export default function ScoreBadge({ score, scoreBand }) {
  const cfg =
    score >= 80
      ? { bg: 'bg-apple-green/15', text: 'text-apple-green', dot: 'bg-apple-green' }
      : score >= 50
      ? { bg: 'bg-apple-yellow/15', text: 'text-apple-yellow', dot: 'bg-apple-yellow' }
      : { bg: 'bg-fill-secondary', text: 'text-ink-tertiary', dot: 'bg-fill-primary' }; // ← fixed

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className="tabular-nums">{score}</span>
      <span className="opacity-60">·</span>
      <span>{scoreBand}</span>
    </span>
  );
}
