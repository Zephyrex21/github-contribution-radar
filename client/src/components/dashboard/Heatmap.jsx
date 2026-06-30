import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['','Mon','','Wed','','Fri',''];

// Bug fix: empty cell used rgba(255,255,255,0.04) — invisible in light mode
// Now uses isDark to pick an appropriate empty-cell color per theme
function getColor(count, isDark) {
  const empty = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  if (!count) return empty;
  if (count === 1) return 'rgba(10,132,255,0.25)';
  if (count <= 2)  return 'rgba(10,132,255,0.45)';
  if (count <= 4)  return 'rgba(10,132,255,0.65)';
  return 'rgba(10,132,255,0.90)';
}

export default function Heatmap({ data = [] }) {
  const { isDark } = useTheme();

  const map = useMemo(() => {
    const m = {};
    data.forEach(d => { m[d.date] = d.count; });
    return m;
  }, [data]);

  const today = new Date();

  const weeks = useMemo(() => {
    const cells = [];
    for (let i = 181; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      cells.push({ date: key, count: map[key] || 0, day: d.getDay(), month: d.getMonth() });
    }
    const startDay = cells[0].day;
    const padded = Array.from({ length: startDay }, () => null).concat(cells);
    const w = [];
    for (let i = 0; i < padded.length; i += 7) w.push(padded.slice(i, i + 7));
    return w;
  }, [map]);

  const monthLabels = useMemo(() => {
    const labels = [];
    weeks.forEach((week, wi) => {
      const first = week.find(c => c);
      if (first && (wi === 0 || first.month !== (weeks[wi - 1]?.find(c => c)?.month))) {
        labels.push({ wi, label: MONTHS[first.month] });
      }
    });
    return labels;
  }, [weeks]);

  const totalActivity = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="section-label">Activity — last 6 months</p>
        <p className="text-xs" style={{ color: 'var(--c-text-4)' }}>{totalActivity} total actions</p>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div style={{ position: 'relative', paddingTop: 18 }}>
          {/* Month labels */}
          <div className="flex" style={{ marginLeft: 24 }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find(l => l.wi === wi);
              return (
                <div key={wi} style={{ width: 13, marginRight: 2 }}>
                  {label && (
                    <span
                      className="text-[9px] absolute"
                      style={{ color: 'var(--c-text-4)' }}
                    >
                      {label.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5" style={{ marginTop: 4 }}>
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((d, i) => (
                <div key={i} style={{ height: 11, width: 22 }} className="flex items-center justify-end pr-1">
                  <span className="text-[9px]" style={{ color: 'var(--c-text-4)' }}>{d}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week[di];
                  return (
                    <div
                      key={di}
                      title={cell ? `${cell.date}: ${cell.count} action${cell.count !== 1 ? 's' : ''}` : ''}
                      style={{
                        width: 11, height: 11, borderRadius: 3,
                        background: cell ? getColor(cell.count, isDark) : getColor(0, isDark),
                        transition: 'transform 0.1s, background 0.25s ease',
                        cursor: cell?.count ? 'pointer' : 'default',
                      }}
                      className={cell?.count ? 'hover:scale-125' : ''}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px]" style={{ color: 'var(--c-text-4)' }}>Less</span>
          {[0, 1, 2, 4, 6].map(n => (
            <div
              key={n}
              style={{ width: 11, height: 11, borderRadius: 3, background: getColor(n, isDark), transition: 'background 0.25s ease' }}
            />
          ))}
          <span className="text-[10px]" style={{ color: 'var(--c-text-4)' }}>More</span>
        </div>
      </div>
    </div>
  );
}
