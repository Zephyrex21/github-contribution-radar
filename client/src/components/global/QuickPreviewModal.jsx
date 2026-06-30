import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ExternalLink, Star, GitFork, Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect } from 'react';
import ScoreBadge from '../discovery/ScoreBadge';
import { issuesApi, savedItemsApi } from '../../api/index';
import { labelColors, timeAgo, formatNumber } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const DIFF_TAG = {
  Beginner: 'bg-apple-green/15 text-apple-green',
  Moderate: 'bg-apple-yellow/15 text-apple-yellow',
  Advanced: 'bg-apple-red/15 text-apple-red',
};

export default function QuickPreviewModal({ owner, repo, issueNumber, onClose }) {
  const toast = useToast();
  const qc    = useQueryClient();

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { data, isLoading } = useQuery({
    queryKey: ['issue', owner, repo, issueNumber],
    queryFn:  () => issuesApi.getDetail(owner, repo, issueNumber),
  });

  const issue = data?.data;

  const saveMutation = useMutation({
    mutationFn: savedItemsApi.save,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['issue', owner, repo, issueNumber] });
      toast.success('Issue saved to your list');
    },
    onError: () => toast.error('Could not save issue'),
  });

  function handleSave() {
    if (!issue) return;
    saveMutation.mutate({
      githubIssueId:  issue.githubIssueId,
      issueTitle:     issue.title,
      repoFullName:   issue.repo?.fullName,
      githubIssueUrl: issue.url,
      difficultyTag:  issue.difficultyTag,
      language:       issue.repo?.language,
      score:          issue.score,
    });
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <div
        className="h-full w-full max-w-md overflow-y-auto animate-slide-right"
        onClick={e => e.stopPropagation()}
        style={{
          background:   'var(--glass-bg-strong)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          // Bug fix: border-white/[0.06] → CSS var (theme-safe)
          borderLeft: '1px solid var(--glass-border)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4"
          style={{
            background:   'var(--glass-bg-strong)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            // Bug fix: border-white/[0.06] → CSS var
            borderBottom: '1px solid var(--c-sep)',
          }}
        >
          <p className="text-xs font-mono" style={{ color: 'var(--c-text-3)' }}>
            {owner}/{repo}
          </p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
          >
            <X size={15} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-4">
            {[40, 60, 30, 80].map((w, i) => (
              <div key={i} className="skeleton h-4 rounded-lg" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : issue ? (
          <div className="p-5 space-y-5">
            {/* Score + badges */}
            <div className="flex flex-wrap items-center gap-2">
              <ScoreBadge score={issue.score} scoreBand={issue.scoreBand} />
              {issue.difficultyTag && (
                <span className={`tag text-xs ${DIFF_TAG[issue.difficultyTag] || 'bg-fill-tertiary text-ink-tertiary'}`}>
                  {issue.difficultyTag}
                </span>
              )}
            </div>

            <h2 className="text-base font-semibold leading-snug" style={{ color: 'var(--c-text-1)' }}>
              {issue.title}
            </h2>

            {/* Labels */}
            {issue.labels?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {issue.labels.map(l => (
                  <span key={l} className={`tag text-xs ${labelColors(l)}`}>{l}</span>
                ))}
              </div>
            )}

            {/* Body */}
            {issue.bodyPreview && (
              <div className="glass-sm p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--c-text-2)' }}>
                  {issue.bodyPreview}
                </p>
              </div>
            )}

            {/* Repo stats */}
            {issue.repo && (
              <div className="glass-sm p-4 space-y-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--c-text-2)' }}>
                  {issue.repo.fullName}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--c-text-3)' }}>
                  <span className="flex items-center gap-1">
                    <Star size={11} /> {formatNumber(issue.repo.stars)}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={11} /> {formatNumber(issue.repo.forks)}
                  </span>
                  {issue.repo.language && (
                    <span className="text-apple-blue">{issue.repo.language}</span>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs" style={{ color: 'var(--c-text-4)' }}>
              Updated {timeAgo(issue.updatedAt)}
            </p>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {!issue.isSaved ? (
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="btn-primary flex-1 text-xs py-2"
                >
                  <Bookmark size={13} />
                  {saveMutation.isPending ? 'Saving...' : 'Save Issue'}
                </button>
              ) : (
                <div
                  className="flex items-center gap-1.5 flex-1 px-3 py-2 rounded-xl text-xs font-medium text-apple-green"
                  style={{ background: 'rgba(48,209,88,0.10)' }}
                >
                  <BookmarkCheck size={13} /> Saved
                </div>
              )}
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-2 px-3"
              >
                <ExternalLink size={13} /> GitHub
              </a>
            </div>

            {/* What to do next */}
            {issue.whatToDoNext?.length > 0 && (
              <div>
                <p className="section-label mb-3">What to do next</p>
                <ol className="space-y-2">
                  {issue.whatToDoNext.slice(0, 4).map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-xs" style={{ color: 'var(--c-text-2)' }}>
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 text-apple-blue"
                        style={{ background: 'rgba(10,132,255,0.12)' }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
