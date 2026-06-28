import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = 'text-apple-blue', delta, suffix = '' }) {
  return (
    <div
      className="glass p-5 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5"
      style={{ cursor: 'default' }}
    >
      {/* Ambient colour glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: `currentColor` }}
      />

      <div className="relative">
        {Icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'var(--c-fill-3)' }}
          >
            <Icon size={16} className={color} />
          </div>
        )}

        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: 'var(--c-text-1)' }}>
            {value}{suffix}
          </p>
          {delta !== undefined && (
            <div className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
              delta > 0 ? 'text-apple-green' : delta < 0 ? 'text-apple-red' : 'text-ink-quaternary'
            }`}>
              {delta > 0 ? <TrendingUp size={11} /> : delta < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
              {delta > 0 ? `+${delta}` : delta}
            </div>
          )}
        </div>

        <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>{label}</p>
        {delta !== undefined && (
          <p className="text-[10px] mt-1" style={{ color: 'var(--c-text-4)' }}>vs last week</p>
        )}
      </div>
    </div>
  );
}
