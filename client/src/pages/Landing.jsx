import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github, Telescope, BookmarkCheck, BarChart2,
  Zap, GitMerge, Search, Sun, Moon, ArrowRight,
} from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UpstreamWordmark } from '../components/ui/Logo';

/* ─── Upstream mark in white (for blue hero bg) ─── */
function HeroMark({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect x="6"  y="26" width="24" height="3"    rx="1.5" fill="rgba(255,255,255,0.30)" />
      <rect x="6"  y="19" width="24" height="3"    rx="1.5" fill="rgba(255,255,255,0.30)" />
      <rect x="16" y="7"  width="4"  height="15"   rx="2"   fill="white" />
      <path d="M18 4 L11.5 11.5 L13.6 13.6 L18 9.2 L22.4 13.6 L24.5 11.5 Z" fill="rgba(255,255,255,0.92)" />
    </svg>
  );
}

/* ─── Animated preview box ─── */
const SEARCH_TEXT = 'react hooks typescript good first issue...';
const ROWS = [
  { score: 95, title: 'Fix useCallback memory leak in StrictMode',       repo: 'facebook/react',  lang: 'TypeScript', tag: 'Beginner', scoreColor: '#30d158', tagColor: '#30d158', tagBg: 'rgba(48,209,88,0.12)'   },
  { score: 78, title: 'Add proper TypeScript types for useReducer',       repo: 'preactjs/preact', lang: 'TypeScript', tag: 'Moderate', scoreColor: '#ffd60a', tagColor: '#ffd60a', tagBg: 'rgba(255,214,10,0.12)'  },
  { score: 62, title: 'Optimize hook dependency comparison performance', repo: 'vercel/swr',     lang: 'TypeScript', tag: 'Advanced', scoreColor: '#ff453a', tagColor: '#ff453a', tagBg: 'rgba(255,69,58,0.12)'   },
];

function AnimatedPreview() {
  const { isDark } = useTheme();
  const [typedText,   setTypedText]   = useState('');
  const [phase,       setPhase]       = useState('idle');   // idle|typing|scanning|results|fading
  const [visibleRows, setVisibleRows] = useState(0);
  const [scanWidth,   setScanWidth]   = useState(0);
  const timers = useRef([]);

  function clear() { timers.current.forEach(clearTimeout); timers.current = []; }
  function later(fn, ms) { const t = setTimeout(fn, ms); timers.current.push(t); return t; }

  function runCycle() {
    clear();
    setTypedText('');
    setPhase('typing');
    setVisibleRows(0);
    setScanWidth(0);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(SEARCH_TEXT.slice(0, i));
      if (i >= SEARCH_TEXT.length) {
        clearInterval(interval);
        later(() => { setPhase('scanning'); setScanWidth(0); }, 300);
        later(() => setScanWidth(100), 350);
        later(() => {
          setPhase('results');
          [1, 2, 3].forEach(n => later(() => setVisibleRows(n), n * 180));
        }, 950);
        later(() => setPhase('fading'), 5800);
        later(() => runCycle(),          6400);
      }
    }, 36);
    timers.current.push(interval);
  }

  useEffect(() => { later(runCycle, 800); return clear; }, []);

  const glassCard = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
    : { background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  const innerBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const textCol = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const monoCol = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.30)';
  const rowHov  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  return (
    <div style={{
      opacity: phase === 'fading' ? 0 : 1,
      transition: 'opacity 0.5s ease',
    }}>
      {/* Animated gradient border wrapper */}
      <div style={{
        padding: '1.5px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(10,132,255,0.6), rgba(191,90,242,0.4), rgba(10,132,255,0.6))',
        backgroundSize: '200% 200%',
        animation: 'gradientBorder 3s linear infinite',
        boxShadow: isDark
          ? '0 32px 80px rgba(0,0,0,0.5), 0 0 40px rgba(10,132,255,0.08)'
          : '0 24px 60px rgba(0,0,0,0.12), 0 0 30px rgba(10,132,255,0.06)',
      }}>
        <div style={{ ...glassCard, borderRadius: '18.5px', border: 'none', padding: '16px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 12,
            background: innerBg,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
            marginBottom: 10,
          }}>
            <Search size={14} style={{ color: monoCol, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: textCol, flex: 1 }}>
              {typedText}
              <span style={{
                display: 'inline-block', width: 2, height: 13,
                background: '#0a84ff', marginLeft: 1, borderRadius: 1,
                animation: phase === 'typing' ? 'blink 0.8s step-end infinite' : 'none',
                opacity: phase === 'typing' ? 1 : 0,
                verticalAlign: 'middle',
              }} />
            </span>
            {phase === 'scanning' || phase === 'results' ? (
              <div style={{
                fontSize: 10, color: '#0a84ff', fontWeight: 600,
                background: 'rgba(10,132,255,0.10)', padding: '2px 8px', borderRadius: 6,
                animation: 'fadeIn 0.2s ease',
              }}>
                {phase === 'scanning' ? 'Scoring…' : `${ROWS.length} results`}
              </div>
            ) : null}
          </div>

          {/* Scanning progress bar */}
          {(phase === 'scanning') && (
            <div style={{ height: 2, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', marginBottom: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, #0a84ff, #bf5af2)',
                width: `${scanWidth}%`,
                transition: 'width 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          )}

          {/* Result rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ROWS.map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'transparent',
                  transition: `opacity 0.35s ease ${i * 0.06}s, transform 0.35s ease ${i * 0.06}s, background 0.15s`,
                  opacity:   visibleRows > i ? 1 : 0,
                  transform: visibleRows > i ? 'translateY(0)' : 'translateY(8px)',
                  cursor: 'default',
                  borderLeft: visibleRows > i ? `2px solid ${r.scoreColor}44` : '2px solid transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = rowHov}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Score badge */}
                <div style={{
                  minWidth: 32, height: 24, borderRadius: 8,
                  background: `${r.scoreColor}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: r.scoreColor,
                  flexShrink: 0,
                  animation: visibleRows > i ? `scorePop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.18 + 0.05}s both` : 'none',
                }}>
                  {r.score}
                </div>

                {/* Title + repo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: textCol, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </p>
                  <p style={{ fontSize: 10, color: monoCol, margin: '2px 0 0', fontFamily: 'monospace' }}>
                    {r.repo} · {r.lang}
                  </p>
                </div>

                {/* Difficulty tag */}
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                  background: r.tagBg, color: r.tagColor, flexShrink: 0,
                  animation: visibleRows > i ? `scorePop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.18 + 0.12}s both` : 'none',
                }}>
                  {r.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main landing page ─── */
export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const { toggle, isDark }        = useTheme();
  const navigate                  = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(user?.onboardingComplete ? '/discovery' : '/onboarding', { replace: true });
  }, [isAuthenticated]);

  const textPrimary   = isDark ? '#ffffff'               : '#1d1d1f';
  const textSecondary = isDark ? 'rgba(255,255,255,0.55)': 'rgba(0,0,0,0.55)';
  const textMuted     = isDark ? 'rgba(255,255,255,0.25)': 'rgba(0,0,0,0.30)';
  const glassCard     = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
    : { background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--c-bg)', overflowX: 'hidden', position: 'relative' }}>

      {/* ── Injected keyframes ── */}
      <style>{`
        @keyframes gradientBorder {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes scorePop {
          0%   { transform: scale(0.65); opacity: 0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes driftA {
          0%,100% { transform: translate(0px,   0px)   scale(1);    }
          33%     { transform: translate(40px,  -30px)  scale(1.08); }
          66%     { transform: translate(-25px,  45px)  scale(0.94); }
        }
        @keyframes driftB {
          0%,100% { transform: translate(0px,   0px)   scale(1);    }
          33%     { transform: translate(-50px,  20px)  scale(1.05); }
          66%     { transform: translate( 30px, -40px)  scale(0.96); }
        }
        @keyframes driftC {
          0%,100% { transform: translate(0px,   0px)   scale(1);    }
          50%     { transform: translate( 20px,  30px)  scale(1.06); }
        }
        @keyframes orbitRing {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroFloat {
          0%,100% { transform: translateY(0px);  }
          50%     { transform: translateY(-10px); }
        }
        @keyframes statCount {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      {/* ── Ambient background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '15%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,132,255,0.12), transparent 65%)',
          animation: 'driftA 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '5%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(191,90,242,0.08), transparent 65%)',
          animation: 'driftB 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', left: '5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(48,209,88,0.06), transparent 65%)',
          animation: 'driftC 16s ease-in-out infinite',
        }} />
        {/* Subtle dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Nav ── */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0' }}>
          <UpstreamWordmark size={30} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggle}
              style={{
                padding: '8px', borderRadius: 12, background: 'transparent', border: 'none',
                cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                transition: 'color 0.15s',
              }}
              title={isDark ? 'Light mode' : 'Dark mode'}
              onMouseEnter={e => e.currentTarget.style.color = isDark ? 'white' : 'black'}
              onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/github`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                background: 'var(--c-fill-3)', border: '1px solid var(--glass-border)',
                color: textSecondary, textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-fill-2)'; e.currentTarget.style.color = textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-fill-3)'; e.currentTarget.style.color = textSecondary; }}
            >
              <Github size={13} /> Sign in
            </a>
          </div>
        </header>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', padding: '64px 0 48px' }}>

          {/* Logo mark with orbit ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{ position: 'relative', animation: 'heroFloat 6s ease-in-out infinite' }}>
              {/* Outer orbit ring */}
              <div style={{
                position: 'absolute', inset: -18,
                border: `1px dashed ${isDark ? 'rgba(10,132,255,0.25)' : 'rgba(10,132,255,0.20)'}`,
                borderRadius: '50%',
                animation: 'orbitRing 12s linear infinite',
              }}>
                {/* Dot on ring */}
                <div style={{
                  position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)',
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#0a84ff',
                  boxShadow: '0 0 8px rgba(10,132,255,0.8)',
                }} />
              </div>

              {/* Inner glow ring */}
              <div style={{
                position: 'absolute', inset: -8,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(10,132,255,0.15), transparent 70%)',
              }} />

              {/* Icon container */}
              <div style={{
                width: 88, height: 88, borderRadius: 26,
                background: 'linear-gradient(145deg, #1a91ff, #0a84ff, #0062cc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 50px rgba(10,132,255,0.45), 0 0 100px rgba(10,132,255,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
                position: 'relative',
              }}>
                <HeroMark size={50} />
                {/* Inner highlight */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
                  borderRadius: '26px 26px 50% 50%',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
                }} />
              </div>
            </div>
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999, marginBottom: 28,
            background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.20)',
            color: '#0a84ff', fontSize: 12, fontWeight: 500,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0a84ff', animation: 'blink 2s step-end infinite' }} />
            Open-source contribution discovery · Reimagined
          </div>

          {/* Headline */}
          {/*
            Bug fix: this span previously used a JS isDark-ternary inline style
            WITHOUT backgroundSize set. That combo triggers a Chromium quirk where
            background-clip:text silently fails and paints a solid box instead of
            clipping to glyphs — and because the box color came from the isDark
            ternary, it visually flipped opposite on every theme toggle.
            Fix: use the existing proven `.gradient-text` class, which reads
            `--gradient-text` directly from the [data-theme] DOM attribute
            (zero JS state dependency — same technique already working correctly
            on Dashboard/Onboarding headers elsewhere in the app).
          */}
          <h1 style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 20 }}>
            <span
              className="gradient-text"
              style={{ display: 'block', backgroundSize: '100% 100%' }}
            >
              Find your next
            </span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #0a84ff 0%, #bf5af2 60%, #0a84ff 100%)',
              backgroundSize: '200% auto',
              animation: 'gradientBorder 4s linear infinite',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              contribution
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 18, color: textSecondary, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65 }}>
            Upstream discovers issues that match your exact stack, scores
            them by fit, and tracks every opportunity from first look to merged PR.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/github`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 16, fontSize: 14, fontWeight: 600,
                background: '#0a84ff', color: 'white', textDecoration: 'none',
                boxShadow: '0 0 30px rgba(10,132,255,0.40), 0 4px 12px rgba(10,132,255,0.30)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1a91ff'; e.currentTarget.style.boxShadow = '0 0 40px rgba(10,132,255,0.55), 0 6px 16px rgba(10,132,255,0.40)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0a84ff'; e.currentTarget.style.boxShadow = '0 0 30px rgba(10,132,255,0.40), 0 4px 12px rgba(10,132,255,0.30)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Github size={16} />
              Continue with GitHub
            </a>
            <a
              href="#features"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '13px 22px', borderRadius: 16, fontSize: 14, fontWeight: 500,
                background: 'var(--c-fill-3)', border: '1px solid var(--glass-border)',
                color: textSecondary, textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-fill-2)'; e.currentTarget.style.color = textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-fill-3)'; e.currentTarget.style.color = textSecondary; }}
            >
              See features <ArrowRight size={14} />
            </a>
          </div>
          <p style={{ fontSize: 12, color: textMuted }}>Free · No credit card · Connects via GitHub OAuth</p>

          {/* Mini stats row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
            marginTop: 40, marginBottom: 0, flexWrap: 'wrap',
          }}>
            {[
              { val: '50+',   label: 'Languages'      },
              { val: '0–100', label: 'Match score'    },
              { val: '6',     label: 'Status stages'  },
              { val: '∞',     label: 'Issues tracked' },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: '12px 28px', textAlign: 'center',
                  borderLeft: i > 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` : 'none',
                  animation: `statCount 0.5s ease ${i * 0.1 + 0.3}s both`,
                }}
              >
                <p style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{s.val}</p>
                <p style={{ fontSize: 11, color: textMuted, margin: '2px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Animated preview box ── */}
        <div style={{ maxWidth: 680, margin: '0 auto 96px' }}>
          <AnimatedPreview />
        </div>

        {/* ── Features grid ── */}
        <div id="features" style={{ paddingBottom: 96 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0a84ff', marginBottom: 10 }}>
              Everything you need
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: textPrimary, margin: 0 }}>
              Built for developers who ship
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { icon: Telescope,     accent: '#0a84ff', title: 'Smart Discovery',    desc: 'Search GitHub with intelligent scoring. Every result ranked by how well it matches your exact stack and experience level.' },
              { icon: BookmarkCheck, accent: '#bf5af2', title: 'Save & Track',        desc: 'Full contribution pipeline: Saved → Exploring → In Progress → PR Opened → Merged. Never lose an opportunity again.' },
              { icon: BarChart2,     accent: '#30d158', title: 'Progress Dashboard',  desc: 'Activity heatmap, streak counter, pipeline view, language breakdown, and monthly goals. See your momentum clearly.' },
              { icon: Zap,           accent: '#ff9f0a', title: 'For You Feed',        desc: 'Personalised issue feed auto-generated from your language and framework preferences. No manual searching required.' },
              { icon: GitMerge,      accent: '#5ac8fa', title: 'Trending Issues',     desc: 'Live trending repos with beginner-friendly issues, sourced from active repositories with 200+ stars.' },
              { icon: Search,        accent: '#ff375f', title: '⌘K Command Palette',  desc: 'Navigate, search, and jump to any part of Upstream instantly. Keyboard-first for maximum developer speed.' },
            ].map((f, i) => (
              <div
                key={f.title}
                style={{
                  ...glassCard, borderRadius: 16, padding: 22,
                  transition: 'all 0.2s ease',
                  animation: `statCount 0.5s ease ${i * 0.08}s both`,
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 32px ${f.accent}18, 0 0 0 1px ${f.accent}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, marginBottom: 16,
                  background: `${f.accent}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={18} style={{ color: f.accent }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: textSecondary, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA banner ── */}
        <div style={{
          marginBottom: 80,
          padding: '48px 40px', borderRadius: 24, textAlign: 'center',
          background: isDark
            ? 'linear-gradient(135deg, rgba(10,132,255,0.08), rgba(191,90,242,0.06))'
            : 'linear-gradient(135deg, rgba(10,132,255,0.06), rgba(191,90,242,0.04))',
          border: `1px solid ${isDark ? 'rgba(10,132,255,0.15)' : 'rgba(10,132,255,0.12)'}`,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: textPrimary, margin: '0 0 12px' }}>
            Ready to contribute upstream?
          </h2>
          <p style={{ fontSize: 15, color: textSecondary, margin: '0 0 28px' }}>
            Join developers finding better issues, faster.
          </p>
          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/auth/github`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 14, fontSize: 14, fontWeight: 600,
              background: '#0a84ff', color: 'white', textDecoration: 'none',
              boxShadow: '0 0 24px rgba(10,132,255,0.35)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1a91ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0a84ff'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Github size={15} /> Get started — it&apos;s free
          </a>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          padding: '24px 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <UpstreamWordmark size={22} />
          <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
            Contribute to open source. Build your presence.
          </p>
        </div>
      </div>
    </div>
  );
}
