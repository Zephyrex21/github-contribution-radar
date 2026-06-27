import { Search, X, Command } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search issues...' }) {
  return (
    <div className="relative group">
      <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-quaternary pointer-events-none transition-colors group-focus-within:text-apple-blue" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-glass pl-10 pr-10 h-11 text-sm w-full"
      />
      {value
        ? <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-ink-quaternary hover:text-ink-secondary transition-colors">
            <X size={13} />
          </button>
        : <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-ink-quaternary px-1.5 py-0.5 rounded-md"
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Command size={9} />K
          </kbd>
      }
    </div>
  );
}
