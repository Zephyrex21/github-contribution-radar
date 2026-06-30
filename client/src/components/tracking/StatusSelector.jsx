import { statusColors } from '../../utils/formatters';

const STATUSES = ['Saved','Exploring','In Progress','PR Opened','Merged','Dropped'];

export default function StatusSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      // Bug fixes:
      // border-white/[0.08] → inline var(--glass-border)  (theme-safe)
      // bg-sys-bg4 text-white on options → text-ink-primary (theme-safe)
      className={`text-xs font-medium px-3 py-1.5 rounded-xl cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-apple-blue
        transition-all appearance-none ${statusColors(value)} bg-transparent`}
      style={{ border: '1px solid var(--glass-border)' }}
    >
      {STATUSES.map(s => (
        <option
          key={s}
          value={s}
          style={{ background: 'var(--c-bg4)', color: 'var(--c-text-1)' }}
        >
          {s}
        </option>
      ))}
    </select>
  );
}
