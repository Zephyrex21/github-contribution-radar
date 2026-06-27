/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* Apple system colors — fixed, same in both themes */
        apple: {
          blue:   '#0a84ff',
          green:  '#30d158',
          yellow: '#ffd60a',
          red:    '#ff453a',
          purple: '#bf5af2',
          orange: '#ff9f0a',
          pink:   '#ff375f',
          teal:   '#5ac8fa',
          indigo: '#5e5ce6',
        },
        /* Theme-aware colors — reference CSS custom properties */
        sys: {
          bg:  'var(--c-bg)',
          bg2: 'var(--c-bg2)',
          bg3: 'var(--c-bg3)',
          bg4: 'var(--c-bg4)',
          bg5: 'var(--c-bg5)',
          sep: 'var(--c-sep)',
        },
        ink: {
          primary:    'var(--c-text-1)',
          secondary:  'var(--c-text-2)',
          tertiary:   'var(--c-text-3)',
          quaternary: 'var(--c-text-4)',
        },
        fill: {
          primary:     'var(--c-fill-1)',
          secondary:   'var(--c-fill-2)',
          tertiary:    'var(--c-fill-3)',
          quarternary: 'var(--c-fill-4)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass':       '0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.5)',
        'glass-lg':    '0 0 0 1px rgba(255,255,255,0.07), 0 24px 64px rgba(0,0,0,0.7)',
        'glow-blue':   '0 0 20px rgba(10,132,255,0.35)',
        'glow-purple': '0 0 20px rgba(191,90,242,0.30)',
        'glow-green':  '0 0 20px rgba(48,209,88,0.25)',
        'card-light':  '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-up':     'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down':   'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right':  'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':     'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':        'float 6s ease-in-out infinite',
        'toast-in':     'toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-out':    'toastOut 0.25s ease-in forwards',
        'shimmer':      'shimmer 2s linear infinite',
        'spin-slow':    'spin 2s linear infinite',
        'bounce-dot':   'bounceDot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
