import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Telescope, BookmarkCheck, BarChart2, Zap, GitMerge, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ForgeWordmark } from '../components/ui/Logo';

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const { toggle, isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.onboardingComplete ? '/discovery' : '/onboarding', { replace: true });
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-mesh" style={{ backgroundColor: 'var(--c-bg)' }}>
      {/* Ambient glows — only in dark mode */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #0a84ff, transparent 70%)' }} />
          <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #bf5af2, transparent 70%)' }} />
        </div>
      )}

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <ForgeWordmark size={30} />
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="btn-ghost p-2 rounded-xl"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={16} className="text-apple-yellow" /> : <Moon size={16} className="text-apple-indigo" />}
            </button>
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/github`}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Github size={13} /> Sign in
            </a>
          </div>
        </header>

        {/* Hero */}
        <div className="text-center pt-20 pb-16">
          {/* Animated icon */}
          <div className="flex justify-center mb-8 animate-float">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1a8fff, #0a84ff)',
                boxShadow: '0 0 40px rgba(10,132,255,0.4), 0 0 80px rgba(10,132,255,0.15)',
              }}
            >
              <svg width="44" height="44" viewBox="0 0 36 36" fill="none">
                <path d="M18 2 C21 9 27 15 34 18 C27 21 21 27 18 34 C15 27 9 21 2 18 C9 15 15 9 18 2Z" fill="white" opacity="0.95" />
                <circle cx="18" cy="18" r="2.5" fill="#0a84ff" />
              </svg>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-medium"
            style={{
              background: 'rgba(10,132,255,0.08)',
              border: '1px solid rgba(10,132,255,0.2)',
              color: 'var(--c-accent)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-apple-blue animate-pulse-slow" />
            Open-source contribution discovery · Reimagined
          </div>

          <h1 className="text-6xl font-bold tracking-tight leading-tight mb-5">
            <span className="gradient-text">Your guide to</span><br />
            <span className="text-gradient-blue">open source</span>
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-12 leading-relaxed" style={{ color: 'var(--c-text-2)' }}>
            Forge discovers issues that match your exact stack, scores them by fit,
            and tracks every opportunity from first look to merged PR.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/github`}
              className="btn-primary text-sm px-7 py-3 rounded-2xl"
              style={{ boxShadow: '0 0 28px rgba(10,132,255,0.35)' }}
            >
              <Github size={16} />
              Continue with GitHub
            </a>
            <a href="#features" className="btn-secondary text-sm px-5 py-3 rounded-2xl">
              See features →
            </a>
          </div>
          <p className="text-xs mt-5" style={{ color: 'var(--c-text-4)' }}>
            Free · No credit card · Connects via GitHub OAuth
          </p>
        </div>

        {/* Mock UI preview */}
        <div
          className="glass mx-auto max-w-3xl mb-24 p-1 animate-float"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.4)', animationDelay: '0.5s' }}
        >
          <div className="glass-strong rounded-2xl p-4 space-y-2.5">
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'var(--c-fill-3)' }}
            >
              <Search size={14} style={{ color: 'var(--c-text-4)' }} />
              <span className="text-sm" style={{ color: 'var(--c-text-3)' }}>react hooks typescript good first issue...</span>
            </div>
            {[
              { score: 95, title: 'Fix useCallback memory leak in StrictMode', repo: 'facebook/react', lang: 'TypeScript', tag: 'Beginner', color: 'bg-apple-green/12 text-apple-green' },
              { score: 78, title: 'Add proper TypeScript types for useReducer', repo: 'preactjs/preact', lang: 'TypeScript', tag: 'Moderate', color: 'bg-apple-yellow/12 text-apple-yellow' },
              { score: 62, title: 'Optimize hook dependency comparison performance', repo: 'vercel/swr', lang: 'TypeScript', tag: 'Advanced', color: 'bg-apple-red/12 text-apple-red' },
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-fill-tertiary"
                style={{ cursor: 'default' }}
              >
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  r.score >= 80 ? 'bg-apple-green/12 text-apple-green' :
                  r.score >= 60 ? 'bg-apple-yellow/12 text-apple-yellow' :
                                  'bg-white/[0.06] text-ink-tertiary'
                }`}>
                  {r.score}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--c-text-2)' }}>{r.title}</p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--c-text-4)' }}>{r.repo} · {r.lang}</p>
                </div>
                <span className={`tag text-[10px] flex-shrink-0 ${r.color}`}>{r.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-24">
          {[
            { icon: Telescope,     color: 'text-apple-blue',   bg: 'bg-apple-blue/10',   title: 'Smart Discovery',    desc: 'Search GitHub with intelligent scoring. Every result ranked by how well it matches your exact stack.' },
            { icon: BookmarkCheck, color: 'text-apple-purple', bg: 'bg-apple-purple/10', title: 'Save & Track',        desc: 'Full pipeline: Saved → Exploring → In Progress → PR Opened → Merged. Never lose an opportunity.' },
            { icon: BarChart2,     color: 'text-apple-green',  bg: 'bg-apple-green/10',  title: 'Progress Dashboard', desc: 'Activity heatmap, streak counter, and status breakdown. See your contribution momentum clearly.' },
            { icon: Zap,           color: 'text-apple-orange', bg: 'bg-apple-orange/10', title: 'For You Feed',        desc: 'Personalized issue feed auto-generated from your language preferences. No manual searching.' },
            { icon: GitMerge,      color: 'text-apple-teal',   bg: 'bg-apple-teal/10',   title: 'Trending Now',        desc: 'Live trending repos with beginner-friendly issues, refreshed every session.' },
            { icon: Search,        color: 'text-apple-pink',   bg: 'bg-apple-pink/10',   title: '⌘K Command Palette', desc: 'Navigate, search, and jump to any part of Forge instantly with the keyboard.' },
          ].map(f => (
            <div
              key={f.title}
              className="glass p-5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon size={17} className={f.color} />
              </div>
              <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--c-text-1)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text-3)' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t pb-8 pt-6 text-center" style={{ borderColor: 'var(--c-sep)' }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ForgeWordmark size={22} />
          </div>
          <p className="text-xs" style={{ color: 'var(--c-text-4)' }}>
            Build your open-source presence
          </p>
        </div>
      </div>
    </div>
  );
}
