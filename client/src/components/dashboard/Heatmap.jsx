import { useMemo } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['','Mon','','Wed','','Fri',''];

function getColor(count) {
  if (!count) return 'rgba(255,255,255,0.04)';
  if (count === 1) return 'rgba(10,132,255,0.20)';
  if (count <= 2)  return 'rgba(10,132,255,0.40)';
  if (count <= 4)  return 'rgba(10,132,255,0.65)';
  return 'rgba(10,132,255,0.90)';
}

export default function Heatmap({ data = [] }) {
  // data: [{ date: 'YYYY-MM-DD', count: N }, ...]
  const map = useMemo(() => {
    const m = {};
    data.forEach(d => { m[d.date] = d.count; });
    return m;
  }, [data]);

  // Build 26 weeks grid (182 days) ending today
  const today = new Date();
  const weeks = useMemo(() => {
    const cells = [];
    for (let i = 181; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      cells.push({ date: key, count: map[key] || 0, day: d.getDay(), month: d.getMonth() });
    }
    // pad start so first column starts on Sunday
    const startDay = cells[0].day;
    const padded = Array.from({ length: startDay }, () => null).concat(cells);
    // chunk into weeks
    const w = [];
    for (let i = 0; i < padded.length; i += 7) w.push(padded.slice(i, i + 7));
    return w;
  }, [map]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    weeks.forEach((week, wi) => {
      const first = week.find(c => c);
      if (first && (wi === 0 || first.month !== (weeks[wi-1]?.find(c=>c)?.month))) {
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
        <p className="text-xs text-ink-tertiary">{totalActivity} total actions</p>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <div style={{ position: 'relative', paddingTop: 18 }}>
          {/* Month labels */}
          <div className="flex" style={{ marginLeft: 24 }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find(l => l.wi === wi);
              return (
                <div key={wi} style={{ width: 13, marginRight: 2 }}>
                  {label && <span className="text-[9px] text-ink-quaternary absolute">{label.label}</span>}
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
                  <span className="text-[9px] text-ink-quaternary">{d}</span>
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
                        background: cell ? getColor(cell.count) : 'rgba(255,255,255,0.04)',
                        transition: 'transform 0.1s',
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
          <span className="text-[10px] text-ink-quaternary">Less</span>
          {[0, 1, 2, 4, 6].map(n => (
            <div key={n} style={{ width: 11, height: 11, borderRadius: 3, background: getColor(n) }} />
          ))}
          <span className="text-[10px] text-ink-quaternary">More</span>
        </div>
      </div>
    </div>
  );
}
