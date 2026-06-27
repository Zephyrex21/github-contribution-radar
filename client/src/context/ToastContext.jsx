import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type, duration, removing: false }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, removing: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 280);
    }, duration);
    return id;
  }, []);

  const toast = {
    success: (msg, dur) => add(msg, 'success', dur),
    error:   (msg, dur) => add(msg, 'error',   dur),
    info:    (msg, dur) => add(msg, 'info',    dur),
    warning: (msg, dur) => add(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}

const TYPE_STYLES = {
  success: { bar: 'bg-apple-green',  icon: '✓', color: 'text-apple-green' },
  error:   { bar: 'bg-apple-red',    icon: '✕', color: 'text-apple-red'   },
  warning: { bar: 'bg-apple-yellow', icon: '!', color: 'text-apple-yellow' },
  info:    { bar: 'bg-apple-blue',   icon: 'i', color: 'text-apple-blue'  },
};

function ToastItem({ toast }) {
  const s = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 min-w-[260px] max-w-[360px] glass-strong shadow-glass-lg
        ${toast.removing ? 'animate-toast-out' : 'animate-toast-in'}`}
    >
      <span className={`text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${s.color} bg-current/10`}
        style={{ fontSize: 10 }}
      >
        {s.icon}
      </span>
      <p className="text-sm text-ink-primary leading-snug">{toast.message}</p>
      <div className={`absolute bottom-0 left-0 h-0.5 rounded-b-xl ${s.bar}`}
        style={{ width: '100%', animation: `shrink ${toast.duration}ms linear forwards` }} />
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
