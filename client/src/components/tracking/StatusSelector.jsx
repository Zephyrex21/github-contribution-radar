import { statusColors } from '../../utils/formatters';
const STATUSES = ['Saved','Exploring','In Progress','PR Opened','Merged','Dropped'];
export default function StatusSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`text-xs font-medium px-3 py-1.5 rounded-xl border border-white/[0.08] cursor-pointer focus:outline-none focus:ring-1 focus:ring-apple-blue transition-all appearance-none ${statusColors(value)} bg-transparent`}
    >
      {STATUSES.map(s => <option key={s} value={s} className="bg-sys-bg4 text-white">{s}</option>)}
    </select>
  );
}
