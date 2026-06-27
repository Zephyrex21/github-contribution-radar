/**
 * Forge Logo — stylized forge-spark mark
 * Exports: ForgeIcon, ForgeWordmark
 */

export function ForgeIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="forge-grad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff9f3a" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#0a84ff" />
        </linearGradient>
        <filter id="forge-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Bold F lettermark, slightly stylized */}
      <rect x="8" y="6" width="5" height="24" rx="2.5" fill="url(#forge-grad)" filter="url(#forge-glow)" />
      <rect x="8" y="6" width="18" height="5" rx="2.5" fill="url(#forge-grad)" />
      <rect x="8" y="16" width="14" height="4.5" rx="2" fill="url(#forge-grad)" opacity="0.9" />

      {/* Spark dot — the "forge spark" */}
      <circle cx="28" cy="8" r="3" fill="#ff9f3a" opacity="0.95" filter="url(#forge-glow)" />
    </svg>
  );
}

export function ForgeWordmark({ size = 28, showIcon = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showIcon && (
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #1c1c1e, #2c2c2e)',
            boxShadow: '0 0 14px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
            <rect x="8" y="6" width="5" height="24" rx="2.5" fill="url(#forge-wm-grad)" />
            <rect x="8" y="6" width="18" height="5" rx="2.5" fill="url(#forge-wm-grad)" />
            <rect x="8" y="16" width="14" height="4.5" rx="2" fill="url(#forge-wm-grad)" opacity="0.9" />
            <circle cx="28" cy="8" r="3" fill="#ff9f3a" />
            <defs>
              <linearGradient id="forge-wm-grad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ff9f3a" />
                <stop offset="100%" stopColor="#0a84ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: size * 0.5, letterSpacing: '-0.03em', color: 'var(--c-text-1)' }}
      >
        Forge
      </span>
    </div>
  );
}

