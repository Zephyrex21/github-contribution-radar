const LANGUAGES = ['JavaScript','TypeScript','Python','Go','Rust','Java','C++','Ruby','PHP','Swift'];
const LABELS    = ['good first issue','help wanted','bug','documentation','enhancement'];
const SORT      = [
  { value: 'score',   label: 'Best Match'        },
  { value: 'updated', label: 'Recently Updated'  },
  { value: 'reactions',label: 'Most Reactions'   },
];

export default function FilterPanel({ filters, onChange }) {
  function set(k, v) { onChange({ ...filters, [k]: v }); }
  const hasActive = filters.language || filters.label;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {[
        { key: 'language', placeholder: 'Language', opts: LANGUAGES },
        { key: 'label',    placeholder: 'Label',    opts: LABELS },
      ].map(({ key, placeholder, opts }) => (
        <div key={key} className="relative">
          <select
            value={filters[key] || ''}
            onChange={e => set(key, e.target.value)}
            className="input-glass text-xs h-8 pl-3 pr-7 cursor-pointer appearance-none min-w-[120px]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="">{placeholder}</option>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {filters[key] && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-apple-blue" />
          )}
        </div>
      ))}

      <select
        value={filters.sort || 'score'}
        onChange={e => set('sort', e.target.value)}
        className="input-glass text-xs h-8 pl-3 pr-7 cursor-pointer appearance-none min-w-[140px]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
      >
        {SORT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasActive && (
        <button
          onClick={() => onChange({ language: '', label: '', sort: 'score' })}
          className="text-xs text-apple-blue hover:text-apple-blue/80 transition-colors px-2 h-8"
        >
          Clear
        </button>
      )}
    </div>
  );
}
