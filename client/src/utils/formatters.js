export function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}
export function truncate(str, n = 100) { return !str ? '' : str.length > n ? str.slice(0, n) + '…' : str; }
export function formatNumber(n) { return n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n || 0); }

export function labelColors(l) {
  const label = (l || '').toLowerCase();
  if (label === 'bug')                         return 'bg-apple-red/12 text-apple-red';
  if (label === 'good first issue')            return 'bg-apple-green/12 text-apple-green';
  if (label === 'help wanted')                 return 'bg-apple-blue/12 text-apple-blue';
  if (label === 'documentation' || label === 'docs') return 'bg-apple-purple/12 text-apple-purple';
  if (label === 'enhancement' || label === 'feature') return 'bg-apple-indigo/12 text-apple-indigo';
  if (label === 'question')                    return 'bg-apple-yellow/12 text-apple-yellow';
  if (label === 'wontfix')                     return 'bg-white/[0.06] text-ink-tertiary';
  return 'bg-white/[0.05] text-ink-tertiary';
}

export function statusColors(status) {
  const map = {
    Saved:         'bg-white/[0.07] text-ink-tertiary',
    Exploring:     'bg-apple-blue/12 text-apple-blue',
    'In Progress': 'bg-apple-orange/12 text-apple-orange',
    'PR Opened':   'bg-apple-purple/12 text-apple-purple',
    Merged:        'bg-apple-green/12 text-apple-green',
    Dropped:       'bg-apple-red/12 text-apple-red',
  };
  return map[status] || 'bg-white/[0.06] text-ink-tertiary';
}
