/**
 * Polaris Logo — 4-pointed north star mark
 * Usage: <PolarisLogo size={32} /> or <PolarisWordmark />
 */

export function PolarisIcon({ size = 32, className = '' }) {
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
        <linearGradient id="polaris-grad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b9eff" />
          <stop offset="100%" stopColor="#0a84ff" />
        </linearGradient>
        <filter id="polaris-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 4-pointed north star — smooth bezier shape */}
      <path
        d="M18 2 C21 9 27 15 34 18 C27 21 21 27 18 34 C15 27 9 21 2 18 C9 15 15 9 18 2Z"
        fill="url(#polaris-grad)"
        filter="url(#polaris-glow)"
      />

      {/* Inner highlight — gives depth */}
      <path
        d="M18 7 C19.8 12 24 16.2 29 18 C24 19.8 19.8 24 18 29 C16.2 24 12 19.8 7 18 C12 16.2 16.2 12 18 7Z"
        fill="rgba(255,255,255,0.18)"
      />

      {/* Center dot */}
      <circle cx="18" cy="18" r="2.2" fill="white" opacity="0.95" />
    </svg>
  );
}

export function PolarisWordmark({ size = 28, showIcon = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showIcon && (
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #1a8fff, #0a84ff)',
            boxShadow: '0 0 14px rgba(10,132,255,0.45)',
          }}
        >
          <svg
            width={size * 0.62}
            height={size * 0.62}
            viewBox="0 0 36 36"
            fill="none"
          >
            <path
              d="M18 2 C21 9 27 15 34 18 C27 21 21 27 18 34 C15 27 9 21 2 18 C9 15 15 9 18 2Z"
              fill="white"
              opacity="0.95"
            />
            <circle cx="18" cy="18" r="2.5" fill="#0a84ff" />
          </svg>
        </div>
      )}
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: size * 0.5, letterSpacing: '-0.02em' }}
      >
        Polaris
      </span>
    </div>
  );
}
