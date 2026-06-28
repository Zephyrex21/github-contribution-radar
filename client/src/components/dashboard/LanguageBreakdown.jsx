const LANG_COLORS = {
  JavaScript:  '#f7df1e',
  TypeScript:  '#3178c6',
  Python:      '#3572a5',
  Go:          '#00add8',
  Rust:        '#dea584',
  Java:        '#b07219',
  'C++':       '#f34b7d',
  Ruby:        '#701516',
  PHP:         '#4f5d95',
  Swift:       '#f05138',
  Kotlin:      '#a97bff',
  'C#':        '#178600',
  CSS:         '#563d7c',
  HTML:        '#e34c26',
  Shell:       '#89e051',
  Vue:         '#41b883',
};

function getColor(lang) {
  return LANG_COLORS[lang] || '#636366';
}

export default function LanguageBreakdown({ data = [] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-32 text-xs" style={{ color: 'var(--c-text-4)' }}>
      No language data yet
    </div>
  );

  const max = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-2.5">
      {data.map(({ lang, count }) => (
        <div key={lang} className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: getColor(lang) }}
          />
          <span className="text-xs w-24 truncate flex-shrink-0" style={{ color: 'var(--c-text-2)' }}>
            {lang}
          </span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-fill-3)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(count / max) * 100}%`,
                background: getColor(lang),
                opacity: 0.85,
              }}
            />
          </div>
          <span className="text-xs tabular-nums flex-shrink-0" style={{ color: 'var(--c-text-4)' }}>
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}
