/**
 * Upstream Logo — theme-aware, no SVG gradient ID conflicts
 *
 * Mark concept: an upward-pointing arrow rising through two horizontal
 * "stream" lines — visualises "contributing upstream" literally.
 * Clean, minimal, works at any size.
 */
import { useTheme } from '../../context/ThemeContext';

function UpstreamMark({ size, lightBg = false }) {
  const s   = size;
  // Colours
  const arrowColor  = lightBg ? '#0071e3' : '#0a84ff';
  const streamColor = lightBg ? 'rgba(0,113,227,0.25)' : 'rgba(10,132,255,0.30)';
  const tipColor    = lightBg ? '#30a8ff' : '#5ac8fa';

  return (
    <svg width={s} height={s} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bottom stream line */}
      <rect x="6" y="26" width="24" height="3" rx="1.5" fill={streamColor} />

      {/* Middle stream line */}
      <rect x="6" y="19" width="24" height="3" rx="1.5" fill={streamColor} />

      {/* Upward arrow shaft */}
      <rect x="16" y="7" width="4" height="15" rx="2" fill={arrowColor} />

      {/* Arrow head — upward pointing chevron built from two rects rotated */}
      <path
        d="M18 4 L11.5 11.5 L13.6 13.6 L18 9.2 L22.4 13.6 L24.5 11.5 Z"
        fill={tipColor}
      />
    </svg>
  );
}

export function UpstreamIcon({ size = 32, className = '' }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <UpstreamMark size={size} />
    </div>
  );
}

export function UpstreamWordmark({ size = 28, showIcon = true, className = '' }) {
  const { isDark } = useTheme();

  const containerStyle = isDark
    ? {
        background:  'linear-gradient(145deg, #0d1117, #161b22)',
        boxShadow:   '0 0 16px rgba(10,132,255,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)',
      }
    : {
        background:  'linear-gradient(145deg, #e8f4ff, #dbeeff)',
        boxShadow:   '0 2px 8px rgba(0,113,227,0.12), inset 0 0 0 1px rgba(0,113,227,0.12)',
      };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showIcon && (
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ width: size, height: size, ...containerStyle }}
        >
          <UpstreamMark size={size * 0.72} lightBg={!isDark} />
        </div>
      )}
      <span
        className="font-bold tracking-tight"
        style={{
          fontSize:      size * 0.5,
          letterSpacing: '-0.025em',
          color:         'var(--c-text-1)',
        }}
      >
        Upstream
      </span>
    </div>
  );
}
