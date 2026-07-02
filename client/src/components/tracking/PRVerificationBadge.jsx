import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GitPullRequest, CheckCircle2, XCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { savedItemsApi } from '../../api/index';
import { useToast } from '../../context/ToastContext';

/**
 * PRVerificationBadge
 *
 * Shows on any saved issue where status is 'In Progress', 'PR Opened', or 'Merged'.
 * Lets the user verify their PR against GitHub and displays the result.
 *
 * Props:
 *   savedItemId  — the _id of the SavedItem document
 *   verifiedPR   — existing verifiedPR subdoc from the SavedItem (may be null)
 *   onVerified   — callback(newStatus) fired when verification changes the item's status
 *   queryKeys    — array of TanStack query keys to invalidate on success
 */
export default function PRVerificationBadge({ savedItemId, verifiedPR, onVerified, queryKeys = [] }) {
  const toast = useToast();
  const qc    = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => savedItemsApi.verifyPR(savedItemId),
    onSuccess: (res) => {
      const d = res.data;

      // Invalidate all provided query keys so UI updates everywhere
      queryKeys.forEach(key => qc.invalidateQueries({ queryKey: key }));

      if (!d.verified) {
        toast.info('No matching PR found. Make sure your PR body mentions the issue number (e.g. "closes #123").');
        return;
      }

      if (d.statusChanged) {
        toast.success(
          `PR ${d.prState === 'merged' ? 'merged! 🎉' : 'found!'} Status updated to "${d.newStatus}".`
        );
        onVerified?.(d.newStatus);
      } else {
        toast.success(`PR verified — ${d.prState === 'merged' ? 'merged ✓' : 'open'}`);
      }
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || 'Verification failed. Try again.');
    },
  });

  const isPending = mutation.isPending;

  // ── Already verified — show badge + re-verify option ──────────────────────
  if (verifiedPR?.url) {
    const isOpen   = verifiedPR.state === 'open';
    const isMerged = verifiedPR.state === 'merged';
    const isClosed = verifiedPR.state === 'closed';

    const stateConfig = isMerged
      ? { label: 'PR Merged',  icon: CheckCircle2, color: 'text-apple-green', bg: 'rgba(48,209,88,0.10)',  border: 'rgba(48,209,88,0.20)'  }
      : isOpen
      ? { label: 'PR Open',    icon: GitPullRequest, color: 'text-apple-blue',  bg: 'rgba(10,132,255,0.10)', border: 'rgba(10,132,255,0.20)' }
      : { label: 'PR Closed',  icon: XCircle,      color: 'text-apple-red',   bg: 'rgba(255,69,58,0.10)',  border: 'rgba(255,69,58,0.20)'  };

    const Icon = stateConfig.icon;

    return (
      <div
        className="rounded-xl px-3 py-2.5 flex items-start gap-2.5"
        style={{
          background: stateConfig.bg,
          border:     `1px solid ${stateConfig.border}`,
        }}
      >
        <Icon size={14} className={`${stateConfig.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold ${stateConfig.color}`}>
              {stateConfig.label}
            </span>
            <button
              onClick={() => mutation.mutate()}
              disabled={isPending}
              className="flex items-center gap-1 text-[10px] transition-colors flex-shrink-0"
              style={{ color: 'var(--c-text-4)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
              title="Re-verify"
            >
              {isPending
                ? <Loader2 size={10} className="animate-spin" />
                : <RefreshCw size={10} />
              }
              {isPending ? 'Checking...' : 'Refresh'}
            </button>
          </div>
          <a
            href={verifiedPR.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] flex items-center gap-1 mt-0.5 hover:underline truncate"
            style={{ color: 'var(--c-text-3)' }}
          >
            <span className="truncate">
              #{verifiedPR.number} · {verifiedPR.title}
            </span>
            <ExternalLink size={9} className="flex-shrink-0" />
          </a>
        </div>
      </div>
    );
  }

  // ── Not verified yet — show verify button ─────────────────────────────────
  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
      style={{
        background: 'var(--c-fill-3)',
        border:     '1px solid var(--glass-border)',
        color:      isPending ? 'var(--c-text-3)' : 'var(--c-text-2)',
      }}
      onMouseEnter={e => {
        if (!isPending) {
          e.currentTarget.style.background = 'rgba(10,132,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(10,132,255,0.25)';
          e.currentTarget.style.color = '#0a84ff';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--c-fill-3)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.color = 'var(--c-text-2)';
      }}
    >
      {isPending ? (
        <>
          <Loader2 size={13} className="animate-spin text-apple-blue" />
          Checking GitHub...
        </>
      ) : (
        <>
          <GitPullRequest size={13} />
          Verify PR on GitHub
        </>
      )}
    </button>
  );
}
