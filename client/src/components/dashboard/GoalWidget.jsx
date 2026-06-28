import { useState } from 'react';
import { Target, Edit3, Check } from 'lucide-react';

const GOAL_KEY = 'upstream_monthly_goal';
const getGoal  = () => parseInt(localStorage.getItem(GOAL_KEY) || '5', 10);
const setGoal  = v  => localStorage.setItem(GOAL_KEY, String(v));

export default function GoalWidget({ merged = 0 }) {
  const [goal,    setGoalState] = useState(getGoal);
  const [editing, setEditing]   = useState(false);
  const [draft,   setDraft]     = useState(String(getGoal()));

  const progress = Math.min(Math.round((merged / goal) * 100), 100);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  function save() {
    const n = Math.max(1, Math.min(99, parseInt(draft, 10) || 5));
    setGoalState(n);
    setGoal(n);
    setEditing(false);
  }

  const month = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="glass p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-apple-orange" />
          <p className="section-label">{month} Goal</p>
        </div>
        <button
          onClick={() => { setEditing(e => !e); setDraft(String(goal)); }}
          className="p-1 rounded-lg transition-colors"
          style={{ color: 'var(--c-text-4)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-2)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
        >
          <Edit3 size={12} />
        </button>
      </div>

      {/* Ring */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <svg width={76} height={76}>
            {/* Track */}
            <circle cx={38} cy={38} r={r}
              fill="none"
              stroke="var(--c-fill-3)"
              strokeWidth={6}
            />
            {/* Progress */}
            <circle cx={38} cy={38} r={r}
              fill="none"
              stroke={progress >= 100 ? '#30d158' : '#ff9f0a'}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 38 38)"
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--c-text-1)' }}>
              {merged}
            </span>
            <span className="text-[9px]" style={{ color: 'var(--c-text-4)' }}>
              / {goal}
            </span>
          </div>
        </div>

        <p className="text-xs mt-2 font-medium" style={{ color: progress >= 100 ? '#30d158' : 'var(--c-text-3)' }}>
          {progress >= 100 ? '🎉 Goal reached!' : `${progress}% of goal`}
        </p>
      </div>

      {/* Edit goal */}
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number" min={1} max={99}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            className="input-glass text-xs text-center py-1.5 flex-1"
            autoFocus
          />
          <button onClick={save} className="btn-primary text-xs px-2 py-1.5 rounded-lg">
            <Check size={11} />
          </button>
        </div>
      ) : (
        <p className="text-xs text-center" style={{ color: 'var(--c-text-4)' }}>
          {goal - merged > 0
            ? `${goal - merged} more merge${goal - merged !== 1 ? 's' : ''} to go`
            : 'All done this month!'}
        </p>
      )}
    </div>
  );
}
