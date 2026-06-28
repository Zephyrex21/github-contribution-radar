import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Telescope, Bookmark, LayoutDashboard, User, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { useKeyboard } from '../../hooks/useKeyboard';

const STATIC_ITEMS = [
  { id: 'discovery', icon: Telescope,      label: 'Go to Discovery', group: 'Navigate', to: '/discovery'            },
  { id: 'trending',  icon: TrendingUp,     label: 'Go to Trending',  group: 'Navigate', to: '/discovery?tab=trending'},
  { id: 'saved',     icon: Bookmark,       label: 'Go to Saved',     group: 'Navigate', to: '/saved'                },
  { id: 'dashboard', icon: LayoutDashboard,label: 'Go to Dashboard', group: 'Navigate', to: '/dashboard'            },
  { id: 'profile',   icon: User,           label: 'Go to Profile',   group: 'Navigate', to: '/profile'              },
];

const RECENT_KEY = 'upstream_recent_searches';
const getRecent  = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };
const saveRecent = q  => {
  const prev = getRecent().filter(x => x !== q).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev]));
};

export default function CommandPalette({ onClose }) {
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(0);
  const [recent,   setRecent]   = useState(getRecent);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);
  useKeyboard([{ key: 'Escape', handler: onClose }]);

  const filtered = query.trim()
    ? STATIC_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : STATIC_ITEMS;

  const recentItems = query.trim() ? [] : recent.map((r, i) => ({
    id: 'recent_' + i, icon: Clock, label: r, group: 'Recent Searches',
    action: () => { navigate(`/discovery?q=${encodeURIComponent(r)}`); onClose(); }
  }));

  const items = [...recentItems, ...filtered];

  function handleSelect(item) {
    if (item.to)     { navigate(item.to); onClose(); return; }
    if (item.action) { item.action(); return; }
    if (query.trim()) {
      saveRecent(query.trim());
      navigate(`/discovery?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, items.length)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selected < items.length) handleSelect(items[selected]);
      else if (query.trim()) {
        saveRecent(query.trim());
        navigate(`/discovery?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  }

  const groups = {};
  items.forEach(i => { if (!groups[i.group]) groups[i.group] = []; groups[i.group].push(i); });
  let idx = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-xl animate-scale-in"
        onClick={e => e.stopPropagation()}
        style={{
          background:   'var(--glass-bg-strong)',
          border:       '1px solid var(--glass-border-s)',
          borderRadius: 20,
          boxShadow:    '0 32px 80px rgba(0,0,0,0.6)',
          overflow:     'hidden',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--c-sep)' }}
        >
          <Search size={16} style={{ color: 'var(--c-text-3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search issues, navigate pages..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--c-text-1)' }}
          />
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{ background: 'var(--c-fill-3)', border: '1px solid var(--glass-border)', color: 'var(--c-text-4)' }}
          >
            ESC
          </kbd>
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
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelected(i)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                    style={{
                      background: selected === i ? 'rgba(10,132,255,0.12)' : 'transparent',
                      color:      selected === i ? 'var(--c-text-1)'       : 'var(--c-text-2)',
                    }}
                  >
                    <Icon size={15} style={{ color: selected === i ? 'var(--c-accent)' : 'var(--c-text-4)' }} />
                    <span className="flex-1">{item.label}</span>
                    {selected === i && <ArrowRight size={13} style={{ color: 'var(--c-accent)' }} />}
                  </button>
                );
              })}
            </div>
          ))}

          {query.trim() && (
            <div>
              <p className="section-label px-4 py-1.5">Search</p>
              <button
                onClick={() => { saveRecent(query.trim()); navigate(`/discovery?q=${encodeURIComponent(query.trim())}`); onClose(); }}
                onMouseEnter={() => setSelected(items.length)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                style={{
                  background: selected === items.length ? 'rgba(10,132,255,0.12)' : 'transparent',
                  color: 'var(--c-text-2)',
                }}
              >
                <Search size={15} style={{ color: 'var(--c-text-4)' }} />
                <span>
                  Search for "<span style={{ color: 'var(--c-accent)' }}>{query}</span>"
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
