import { AlertCircle } from 'lucide-react';

export function SkeletonCard() {
  return (
    <div className="glass p-5 space-y-3">
      <div className="flex gap-2"><div className="skeleton h-5 w-24 rounded-full" /><div className="skeleton h-5 w-16 rounded-full" /></div>
      <div className="skeleton h-4 w-4/5 rounded-lg" />
      <div className="skeleton h-3 w-2/5 rounded-lg" />
      <div className="flex gap-2"><div className="skeleton h-4 w-20 rounded-lg" /><div className="skeleton h-4 w-24 rounded-lg" /></div>
      <div className="flex justify-between pt-1"><div className="skeleton h-3 w-28 rounded-lg" /><div className="skeleton h-3 w-12 rounded-lg" /></div>
    </div>
  );
}

export function EmptyState({ icon: Icon, message, subMessage, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-5">
          <Icon size={20} className="text-ink-tertiary" />
        </div>
      )}
      <p className="text-ink-secondary font-semibold mb-1.5">{message}</p>
      {subMessage && <p className="text-ink-tertiary text-sm mb-6 max-w-xs">{subMessage}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-secondary text-xs">{actionLabel}</button>
      )}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-2xl bg-apple-red/10 flex items-center justify-center mb-5">
        <AlertCircle size={20} className="text-apple-red" />
      </div>
      <p className="text-ink-secondary font-semibold mb-1.5">Something went wrong</p>
      <p className="text-ink-tertiary text-sm mb-6 max-w-xs">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary text-xs">Try again</button>}
    </div>
  );
}

export function Pagination({ page, totalCount, perPage = 20, onPageChange }) {
  const totalPages = Math.ceil(totalCount / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button className="btn-secondary text-xs px-3 py-1.5" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← Prev</button>
      <span className="text-ink-tertiary text-xs">Page {page} of {totalPages}</span>
      <button className="btn-secondary text-xs px-3 py-1.5" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next →</button>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-xl font-bold gradient-text mb-1">{title}</h1>
        {subtitle && <p className="text-ink-tertiary text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
