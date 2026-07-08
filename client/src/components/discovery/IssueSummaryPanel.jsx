import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Sparkles, Clock, Zap, CheckCircle2,
  ChevronDown, ChevronUp, Loader2, AlertCircle,
} from 'lucide-react';
import { issuesApi } from '../../api/index';

const COMPLEXITY_STYLES = {
  Beginner:     { color: 'text-apple-green',  bg: 'rgba(48,209,88,0.10)',  border: 'rgba(48,209,88,0.20)'  },
  Intermediate: { color: 'text-apple-yellow', bg: 'rgba(255,214,10,0.10)', border: 'rgba(255,214,10,0.20)' },
  Advanced:     { color: 'text-apple-red',    bg: 'rgba(255,69,58,0.10)',  border: 'rgba(255,69,58,0.20)'  },
};

export default function IssueSummaryPanel({ issue, repoFullName }) {
  const [summary,   setSummary]   = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const mutation = useMutation({
    mutationFn: () => issuesApi.summarize({
      title:        issue.title,
      bodyPreview:  issue.bodyPreview,
      labels:       issue.labels || [],
      repoFullName: repoFullName || issue.repoFullName,
      language:     issue.language || issue.repo?.language,
      issueUrl:     issue.url,
    }),
    onSuccess: (res) => {
      setSummary(res.data);
      setCollapsed(false);
    },
  });

  const isPending = mutation.isPending;
  const isError   = mutation.isError;

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (!summary && !isPending && !isError) {
    return (
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(191,90,242,0.06), rgba(10,132,255,0.06))', border: '1px solid rgba(191,90,242,0.15)' }}>
        <div className="p-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(191,90,242,0.12)' }}>
            <Sparkles size={18} className="text-apple-purple" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text-1)' }}>AI Issue Summary</p>
            <p className="text-xs mb-4" style={{ color: 'var(--c-text-3)' }}>
              Get a plain-English breakdown — what the issue needs, required skills,
              complexity level, and a suggested approach. Powered by Gemini.
            </p>
            <button
              onClick={() => mutation.mutate()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
              style={{ background: 'rgba(191,90,242,0.12)', border: '1px solid rgba(191,90,242,0.25)', color: '#bf5af2' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(191,90,242,0.22)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(191,90,242,0.12)'; }}
            >
              <Sparkles size={13} /> Summarize with AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(191,90,242,0.06), rgba(10,132,255,0.06))', border: '1px solid rgba(191,90,242,0.15)' }}>
        <Loader2 size={16} className="text-apple-purple animate-spin flex-shrink-0" />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--c-text-1)' }}>Analysing issue...</p>
          <p className="text-xs" style={{ color: 'var(--c-text-4)' }}>Gemini is reading the issue and generating a summary</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    const msg = mutation.error?.response?.data?.message || 'Could not generate summary.';
    return (
      <div className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.15)' }}>
        <AlertCircle size={16} className="text-apple-red flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-apple-red mb-1">Summary failed</p>
          <p className="text-xs mb-3" style={{ color: 'var(--c-text-3)' }}>{msg}</p>
          <button onClick={() => mutation.mutate()} className="text-xs text-apple-blue hover:underline">Try again</button>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  const s      = summary;
  const cStyle = COMPLEXITY_STYLES[s.complexity] || COMPLEXITY_STYLES.Intermediate;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(191,90,242,0.05), rgba(10,132,255,0.05))', border: '1px solid rgba(191,90,242,0.15)' }}>

      {/* Header — always visible */}
      <div className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
        style={{ borderBottom: collapsed ? 'none' : '1px solid rgba(191,90,242,0.12)' }}
        onClick={() => setCollapsed(c => !c)}>
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles size={13} className="text-apple-purple" />
          <span className="text-xs font-semibold" style={{ color: 'var(--c-text-1)' }}>AI Summary</span>
          <span className="tag text-[10px] font-semibold"
            style={{ background: cStyle.bg, color: cStyle.color.replace('text-',''), border: `1px solid ${cStyle.border}` }}>
            {s.complexity}
          </span>
          {s.estimatedTime && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--c-text-4)' }}>
              <Clock size={9} />{s.estimatedTime}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={e => { e.stopPropagation(); setSummary(null); mutation.mutate(); }}
            className="text-[10px] transition-colors" style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#bf5af2'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}>
            Regenerate
          </button>
          {collapsed ? <ChevronDown size={13} style={{ color: 'var(--c-text-4)' }} />
                     : <ChevronUp   size={13} style={{ color: 'var(--c-text-4)' }} />}
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-5 space-y-5">
          <div>
            <p className="section-label mb-2">What this issue needs</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-2)' }}>{s.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: cStyle.bg, border: `1px solid ${cStyle.border}` }}>
              <Zap size={12} className={cStyle.color} />
              <div>
                <p className={`text-[10px] font-semibold ${cStyle.color}`}>{s.complexity}</p>
                {s.complexityReason && <p className="text-[10px]" style={{ color: 'var(--c-text-4)' }}>{s.complexityReason}</p>}
              </div>
            </div>

            {s.beginnerFit && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.18)' }}>
                <CheckCircle2 size={12} className="text-apple-green" />
                <p className="text-[10px] font-semibold text-apple-green">Good first issue</p>
              </div>
            )}

            {s.estimatedTime && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'var(--c-fill-3)', border: '1px solid var(--glass-border)' }}>
                <Clock size={12} style={{ color: 'var(--c-text-3)' }} />
                <p className="text-[10px]" style={{ color: 'var(--c-text-3)' }}>{s.estimatedTime}</p>
              </div>
            )}
          </div>

          {s.skills?.length > 0 && (
            <div>
              <p className="section-label mb-2">Skills needed</p>
              <div className="flex flex-wrap gap-1.5">
                {s.skills.map(skill => (
                  <span key={skill} className="tag text-xs"
                    style={{ background: 'rgba(10,132,255,0.10)', color: 'var(--c-accent)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {s.approach && (
            <div>
              <p className="section-label mb-2">Suggested approach</p>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--c-text-2)' }}>{s.approach}</p>
            </div>
          )}

          <p className="text-[10px]" style={{ color: 'var(--c-text-4)' }}>
            Generated by Gemini 1.5 Flash · Always read the full issue before starting
          </p>
        </div>
      )}
    </div>
  );
}
