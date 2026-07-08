import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ExternalLink, Star, GitFork,
  AlertCircle, Bookmark, BookmarkCheck,
} from 'lucide-react';
import ScoreBadge          from '../components/discovery/ScoreBadge';
import StatusSelector      from '../components/tracking/StatusSelector';
import NotesEditor         from '../components/tracking/NotesEditor';
import PRVerificationBadge from '../components/tracking/PRVerificationBadge';
import IssueSummaryPanel   from '../components/discovery/IssueSummaryPanel';
import { ErrorMessage }    from '../components/ui/index';
import { issuesApi, savedItemsApi } from '../api/index';
import { useToast }        from '../context/ToastContext';
import { timeAgo, formatNumber, labelColors } from '../utils/formatters';

const DIFF = {
  Beginner: 'bg-apple-green/12 text-apple-green',
  Moderate: 'bg-apple-yellow/12 text-apple-yellow',
  Advanced: 'bg-apple-red/12 text-apple-red',
};

const PR_VERIFY_STATUSES = ['In Progress', 'PR Opened', 'Merged'];

export default function IssueDetail() {
  const { owner, repo, issueNumber } = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const qc       = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['issue', owner, repo, issueNumber],
    queryFn:  () => issuesApi.getDetail(owner, repo, issueNumber),
  });
  const issue = data?.data;

  const saveMutation = useMutation({
    mutationFn: savedItemsApi.save,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['issue', owner, repo, issueNumber] });
      toast.success('Issue saved!');
    },
    onError: e => toast.error(e?.response?.data?.message || 'Could not save'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => savedItemsApi.update(id, body),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['issue', owner, repo, issueNumber] }),
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

  /* ── Loading skeleton ── */
  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 w-24 skeleton rounded-lg" />
      <div className="h-9 w-3/4 skeleton rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass h-40" />
          <div className="glass h-60" />
        </div>
        <div className="space-y-4">
          <div className="glass h-40" />
          <div className="glass h-36" />
        </div>
      </div>
    </div>
  );

  if (isError) return (
    <ErrorMessage
      message={error?.response?.data?.message || 'Failed to load issue'}
      onRetry={refetch}
    />
  );
  if (!issue) return null;

  const showVerify = issue.isSaved && PR_VERIFY_STATUSES.includes(issue.savedStatus);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs transition-colors group"
        style={{ color: 'var(--c-text-3)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-1)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-3)'}
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Title */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ScoreBadge score={issue.score} scoreBand={issue.scoreBand} />
          {issue.difficultyTag && (
            <span className={`tag text-xs ${DIFF[issue.difficultyTag] || ''}`}>
              {issue.difficultyTag}
            </span>
          )}
          <span className={`tag text-xs ${
            issue.state === 'open'
              ? 'bg-apple-green/12 text-apple-green'
              : 'bg-apple-red/12 text-apple-red'
          }`}>
            {issue.state}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-snug mb-2 tracking-tight" style={{ color: 'var(--c-text-1)' }}>
          {issue.title}
        </h1>
        <p className="text-xs font-mono" style={{ color: 'var(--c-text-3)' }}>
          {issue.repo?.fullName} · Updated {timeAgo(issue.updatedAt)}
        </p>
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — content */}
        <div className="lg:col-span-2 space-y-4">

          {issue.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.map(l => (
                <span key={l} className={`tag text-xs ${labelColors(l)}`}>{l}</span>
              ))}
            </div>
          )}

          {issue.bodyPreview && (
            <div className="glass p-5">
              <p className="section-label mb-3">Description</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--c-text-2)' }}>
                {issue.bodyPreview}
                {issue.bodyPreview.length >= 300 && (
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-apple-blue hover:underline ml-1"
                  >
                    Read full issue →
                  </a>
                )}
              </p>
            </div>
          )}

          {/* ── AI Issue Summarizer ── */}
          <IssueSummaryPanel
            issue={issue}
            repoFullName={issue.repo?.fullName}
          />

          {issue.whatToDoNext?.length > 0 && (
            <div className="glass p-5">
              <p className="section-label mb-4">What to do next</p>
              <ol className="space-y-3">
                {issue.whatToDoNext.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--c-text-2)' }}>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 text-apple-blue"
                      style={{ background: 'rgba(10,132,255,0.10)' }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full justify-center text-sm"
          >
            <ExternalLink size={14} /> Open on GitHub
          </a>
        </div>

        {/* Right — tracking panel */}
        <div className="space-y-4">

          {/* Save / Track panel */}
          <div className="glass p-5 space-y-3">
            <p className="section-label">Track this issue</p>

            {!issue.isSaved ? (
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="btn-primary w-full justify-center text-sm"
              >
                <Bookmark size={14} />
                {saveMutation.isPending ? 'Saving...' : 'Save Issue'}
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs font-medium text-apple-green">
                  <BookmarkCheck size={14} /> Saved to your list
                </div>
                <StatusSelector
                  value={issue.savedStatus || 'Saved'}
                  onChange={s => updateMutation.mutate({
                    id: issue.savedItemId,
                    body: { status: s },
                  })}
                />
              </>
            )}

            {/* PR Verification — shown when saved + status is PR-relevant */}
            {showVerify && (
              <PRVerificationBadge
                savedItemId={issue.savedItemId}
                verifiedPR={issue.verifiedPR || null}
                onVerified={newStatus =>
                  updateMutation.mutate({
                    id: issue.savedItemId,
                    body: { status: newStatus },
                  })
                }
                queryKeys={[
                  ['issue', owner, repo, issueNumber],
                  ['savedItems'],
                  ['dashboard', 'summary'],
                ]}
              />
            )}

            {/* Notes */}
            {issue.isSaved && (
              <NotesEditor
                itemId={issue.savedItemId}
                initialNote={issue.savedNote || ''}
                onSave={(_, note) =>
                  updateMutation.mutate({
                    id: issue.savedItemId,
                    body: { note },
                  })
                }
              />
            )}
          </div>

          {/* Repo stats */}
          {issue.repo && (
            <div className="glass p-5">
              <p className="section-label mb-4">Repository</p>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text-1)' }}>
                {issue.repo.fullName}
              </p>
              {issue.repo.description && (
                <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--c-text-3)' }}>
                  {issue.repo.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-y-2.5">
                {[
                  { icon: Star,        val: formatNumber(issue.repo.stars || 0),          label: 'Stars', color: 'text-apple-yellow' },
                  { icon: GitFork,     val: formatNumber(issue.repo.forks || 0),          label: 'Forks', color: 'text-apple-teal'   },
                  { icon: AlertCircle, val: formatNumber(issue.repo.openIssuesCount || 0),label: 'Open',  color: 'text-apple-orange' },
                ].map(({ icon: Icon, val, label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-3)' }}>
                    <Icon size={12} className={color} /> {val} {label}
                  </div>
                ))}
                {issue.repo.language && (
                  <div className="flex items-center gap-1.5 text-xs text-apple-blue">
                    <span className="w-2 h-2 rounded-full bg-apple-blue" />
                    {issue.repo.language}
                  </div>
                )}
              </div>
              <a
                href={issue.repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-apple-blue text-xs mt-4 hover:underline"
              >
                View repo <ExternalLink size={10} />
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
