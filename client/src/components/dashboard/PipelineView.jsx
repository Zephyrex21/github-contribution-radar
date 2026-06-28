import { ArrowRight } from 'lucide-react';

const STAGES = [
  { key: 'Saved',       label: 'Saved',       color: '#636366', bg: 'rgba(99,99,102,0.12)'   },
  { key: 'Exploring',   label: 'Exploring',   color: '#0a84ff', bg: 'rgba(10,132,255,0.12)'  },
  { key: 'In Progress', label: 'In Progress', color: '#ff9f0a', bg: 'rgba(255,159,10,0.12)'  },
  { key: 'PR Opened',   label: 'PR Opened',   color: '#bf5af2', bg: 'rgba(191,90,242,0.12)'  },
  { key: 'Merged',      label: 'Merged',      color: '#30d158', bg: 'rgba(48,209,88,0.12)'   },
];

export default function PipelineView({ byStatus = {} }) {
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Stage blocks */}
      <div className="flex items-stretch gap-2">
        {STAGES.map((stage, i) => {
          const count = byStatus[stage.key] || 0;
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={stage.key} className="flex items-center gap-2 flex-1">
              <div
                className="flex-1 rounded-xl p-3 text-center transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: stage.bg, border: `1px solid ${stage.color}22` }}
              >
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: stage.color }}
                >
                  {count}
                </p>
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--c-text-3)' }}>
                  {stage.label}
                </p>
                {total > 0 && (
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--c-text-4)' }}>
                    {pct}%
                  </p>
                )}
              </div>
              {i < STAGES.length - 1 && (
                <ArrowRight size={12} style={{ color: 'var(--c-text-4)', flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mt-3 h-1 rounded-full overflow-hidden flex" style={{ background: 'var(--c-fill-3)' }}>
          {STAGES.map(stage => {
            const count = byStatus[stage.key] || 0;
            const w = (count / total) * 100;
            return w > 0 ? (
              <div
                key={stage.key}
                className="h-full transition-all duration-700"
                style={{ width: `${w}%`, background: stage.color }}
              />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
