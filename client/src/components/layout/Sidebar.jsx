import { NavLink, useNavigate } from 'react-router-dom';
import { Telescope, Bookmark, LayoutDashboard, User, Command, LogOut, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ForgeWordmark } from '../ui/Logo';

const NAV = [
  { to: '/discovery', icon: Telescope,       label: 'Discovery' },
  { to: '/saved',     icon: Bookmark,        label: 'Saved'     },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

export default function Sidebar({ onCommandPalette }) {
  const { user, logout } = useAuth();
  const { toggle, isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRight: '1px solid var(--sidebar-border)',
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}
    >
      {/* Wordmark */}
      <div className="px-4 pt-5 pb-3">
        <NavLink to="/discovery" className="block">
          <ForgeWordmark size={30} />
        </NavLink>
      </div>

      <div className="px-3 pb-2">
        <div className="divider" />
      </div>

      {/* Command palette trigger */}
      <div className="px-3 mb-3">
        <button
          onClick={onCommandPalette}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all duration-150"
          style={{
            background: 'var(--c-fill-3)',
            border: '1px solid var(--glass-border)',
            color: 'var(--c-text-3)',
          }}
        >
          <Command size={13} />
          <span className="flex-1 text-left">Search...</span>
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded-md"
            style={{
              background: 'var(--c-fill-3)',
              border: '1px solid var(--glass-border)',
              color: 'var(--c-text-4)',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="section-label px-2 mb-2">Menu</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="pt-2 pb-1 divider" />
        <p className="section-label px-2 mt-2 mb-2">Account</p>

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={16} />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5">
        <div className="divider mb-3" />

        {/* ─── THEME TOGGLE (FIXED) ───────────────────────────────────────
            Shows "Dark mode" as a feature label.
            Switch is ON (blue, dot-right) when dark mode is ACTIVE.
            Switch is OFF (gray, dot-left) when light mode is active.
            This matches the standard pattern (like macOS System Preferences).
        ─────────────────────────────────────────────────────────────── */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl mb-2 transition-all duration-150"
          style={{
            background: 'var(--c-fill-3)',
            border: '1px solid var(--glass-border)',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Moon size={14} style={{ color: isDark ? '#bf5af2' : 'var(--c-text-4)' }} />
          <span className="text-xs font-medium flex-1 text-left" style={{ color: 'var(--c-text-3)' }}>
            Dark mode
          </span>
          {/* Toggle pill — ON when isDark=true */}
          <div
            className="w-8 h-4 rounded-full relative flex-shrink-0 transition-all duration-300"
            style={{ background: isDark ? '#0a84ff' : 'var(--c-fill-2)' }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300"
              style={{ left: isDark ? 18 : 2 }}
            />
          </div>
        </button>

        {/* User row */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
            : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )
          }
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--c-text-2)' }}>
              {user?.username}
            </p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff453a'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
