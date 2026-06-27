import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Telescope, Bookmark, LayoutDashboard, User, ArrowRight, Clock } from 'lucide-react';
import { useKeyboard } from '../../hooks/useKeyboard';

const STATIC_ITEMS = [
  { id: 'discovery', icon: Telescope,     label: 'Go to Discovery', group: 'Navigate', to: '/discovery' },
  { id: 'saved',     icon: Bookmark,      label: 'Go to Saved',     group: 'Navigate', to: '/saved'     },
  { id: 'dashboard', icon: LayoutDashboard,label:'Go to Dashboard', group: 'Navigate', to: '/dashboard' },
  { id: 'profile',   icon: User,          label: 'Go to Profile',   group: 'Navigate', to: '/profile'   },
];

const RECENT_KEY = 'oss_radar_recent_searches';
function getRecent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } }
function saveRecent(q) {
  const prev = getRecent().filter(x => x !== q).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev]));
}

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [recent, setRecent] = useState(getRecent);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);
  useKeyboard([{ key: 'Escape', handler: onClose }]);

  const filtered = query.trim()
    ? STATIC_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : STATIC_ITEMS;

  const recentItems = query.trim() ? [] : recent.map((r, i) => ({
    id: 'recent_' + i, icon: Clock, label: r, group: 'Recent Searches',
    action: () => { navigate('/discovery?q=' + encodeURIComponent(r)); onClose(); }
  }));

  const items = [...recentItems, ...filtered];

  function handleSelect(item) {
    if (item.to) { navigate(item.to); onClose(); return; }
    if (item.action) { item.action(); return; }
    if (query.trim()) {
      saveRecent(query.trim());
      navigate('/discovery?q=' + encodeURIComponent(query.trim()));
      onClose();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, items.length)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selected < items.length) handleSelect(items[selected]);
      else if (query.trim()) { saveRecent(query.trim()); navigate('/discovery?q=' + encodeURIComponent(query.trim())); onClose(); }
    }
  }

  // Group items
  const groups = {};
  items.forEach(i => { if (!groups[i.group]) groups[i.group] = []; groups[i.group].push(i); });
  let idx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div
        className="w-full max-w-xl animate-scale-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(20,20,20,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search size={16} className="text-ink-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search issues, navigate pages..."
            className="flex-1 bg-transparent text-sm text-ink-primary placeholder-ink-tertiary outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded-md text-ink-quaternary bg-white/[0.05] border border-white/[0.06]">ESC</kbd>
        </div>

        {/* Results */}
        <div className="py-2 max-h-[50vh] overflow-y-auto no-scrollbar">
          {Object.entries(groups).map(([group, groupItems]) => (
            <div key={group}>
              <p className="section-label px-4 py-1.5">{group}</p>
              {groupItems.map(item => {
                const i = idx++;
                const Icon = item.icon;
                return (
                  <button key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                      selected === i ? 'bg-apple-blue/20 text-ink-primary' : 'text-ink-secondary hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={15} className={selected === i ? 'text-apple-blue' : 'text-ink-quaternary'} />
                    <span className="flex-1">{item.label}</span>
                    {selected === i && <ArrowRight size={13} className="text-apple-blue" />}
                  </button>
                );
              })}
            </div>
          ))}
          {query.trim() && (
            <div>
              <p className="section-label px-4 py-1.5">Search</p>
              <button
                onClick={() => { saveRecent(query.trim()); navigate('/discovery?q=' + encodeURIComponent(query.trim())); onClose(); }}
                onMouseEnter={() => setSelected(items.length)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  selected === items.length ? 'bg-apple-blue/20 text-ink-primary' : 'text-ink-secondary'
                }`}
              >
                <Search size={15} className="text-ink-quaternary" />
                <span>Search for "<span className="text-apple-blue">{query}</span>"</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
