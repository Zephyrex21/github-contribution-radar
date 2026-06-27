import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  Saved:        '#636366',
  Exploring:    '#0a84ff',
  'In Progress':'#ff9f0a',
  'PR Opened':  '#bf5af2',
  Merged:       '#30d158',
  Dropped:      '#ff453a',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass-strong px-3 py-2 text-xs">
      <span className="text-ink-primary font-medium">{d.name}</span>
      <span className="text-ink-tertiary ml-2">{d.value}</span>
    </div>
  );
};

export default function StatusPieChart({ byStatus }) {
  const data = Object.entries(byStatus).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-ink-quaternary text-sm">No data yet</div>
  );

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value">
            {data.map(d => <Cell key={d.name} fill={COLORS[d.name] || '#636366'} strokeWidth={0} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 flex-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[d.name] || '#636366' }} />
              <span className="text-ink-secondary">{d.name}</span>
            </div>
            <span className="text-ink-tertiary tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
