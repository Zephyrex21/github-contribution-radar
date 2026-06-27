import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Star, GitFork, AlertCircle, Bookmark, BookmarkCheck } from 'lucide-react';
import ScoreBadge from '../components/discovery/ScoreBadge';
import StatusSelector from '../components/tracking/StatusSelector';
import NotesEditor from '../components/tracking/NotesEditor';
import { ErrorMessage } from '../components/ui/index';
import { issuesApi, savedItemsApi } from '../api/index';
import { useToast } from '../context/ToastContext';
import { timeAgo, formatNumber, labelColors } from '../utils/formatters';

const DIFF = { Beginner:'bg-apple-green/12 text-apple-green', Moderate:'bg-apple-yellow/12 text-apple-yellow', Advanced:'bg-apple-red/12 text-apple-red' };

export default function IssueDetail() {
  const { owner, repo, issueNumber } = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();
  const qc        = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['issue', owner, repo, issueNumber],
    queryFn: () => issuesApi.getDetail(owner, repo, issueNumber),
  });
  const issue = data?.data;

  const saveMutation = useMutation({
    mutationFn: savedItemsApi.save,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['issue', owner, repo, issueNumber] }); toast.success('Saved!'); },
    onError: e => toast.error(e?.response?.data?.message || 'Could not save'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => savedItemsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', owner, repo, issueNumber] }),
  });

  function handleSave() {
    if (!issue) return;
    saveMutation.mutate({ githubIssueId: issue.githubIssueId, issueTitle: issue.title, repoFullName: issue.repo?.fullName, githubIssueUrl: issue.url, difficultyTag: issue.difficultyTag, language: issue.repo?.language, score: issue.score });
  }

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 w-24 skeleton rounded-lg" />
      <div className="h-9 w-3/4 skeleton rounded-xl" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4"><div className="glass h-40" /><div className="glass h-60" /></div>
        <div className="space-y-4"><div className="glass h-40" /><div className="glass h-36" /></div>
      </div>
    </div>
  );
  if (isError) return <ErrorMessage message={error?.response?.data?.message || 'Failed to load issue'} onRetry={refetch} />;
  if (!issue)  return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-tertiary hover:text-ink-primary text-xs transition-colors group">
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      {/* Title area */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ScoreBadge score={issue.score} scoreBand={issue.scoreBand} />
          {issue.difficultyTag && <span className={`tag text-xs ${DIFF[issue.difficultyTag] || ''}`}>{issue.difficultyTag}</span>}
          <span className={`tag text-xs ${issue.state === 'open' ? 'bg-apple-green/12 text-apple-green' : 'bg-apple-red/12 text-apple-red'}`}>
            {issue.state}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-ink-primary leading-snug mb-2 tracking-tight">{issue.title}</h1>
        <p className="text-ink-tertiary text-xs font-mono">{issue.repo?.fullName} · Updated {timeAgo(issue.updatedAt)}</p>
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {issue.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.map(l => <span key={l} className={`tag text-xs ${labelColors(l)}`}>{l}</span>)}
            </div>
          )}

          {issue.bodyPreview && (
            <div className="glass p-5">
              <p className="section-label mb-3">Description</p>
              <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">
                {issue.bodyPreview}
                {issue.bodyPreview.length >= 300 && (
                  <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:underline ml-1">Read full issue →</a>
                )}
              </p>
            </div>
          )}

          {issue.whatToDoNext?.length > 0 && (
            <div className="glass p-5">
              <p className="section-label mb-4">What to do next</p>
              <ol className="space-y-3">
                {issue.whatToDoNext.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink-secondary">
                    <span className="w-5 h-5 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <a href={issue.url} target="_blank" rel="noopener noreferrer"
            className="btn-secondary w-full justify-center text-sm">
            <ExternalLink size={14} /> Open on GitHub
          </a>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="glass p-5">
            <p className="section-label mb-4">Track this issue</p>
            {!issue.isSaved ? (
              <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary w-full justify-center text-sm">
                <Bookmark size={14} /> {saveMutation.isPending ? 'Saving...' : 'Save Issue'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-apple-green text-xs font-medium">
                  <BookmarkCheck size={14} /> Saved to your list
                </div>
                <StatusSelector
                  value={issue.savedStatus || 'Saved'}
                  onChange={s => updateMutation.mutate({ id: issue.savedItemId, body: { status: s } })}
                />
              </div>
            )}
            {issue.isSaved && (
              <div className="mt-3">
                <NotesEditor itemId={issue.savedItemId} initialNote=""
                  onSave={(_, note) => updateMutation.mutate({ id: issue.savedItemId, body: { note } })} />
              </div>
            )}
          </div>

          {issue.repo && (
            <div className="glass p-5">
              <p className="section-label mb-4">Repository</p>
              <p className="text-sm font-semibold text-ink-primary mb-1">{issue.repo.fullName}</p>
              {issue.repo.description && <p className="text-ink-tertiary text-xs mb-4 leading-relaxed">{issue.repo.description}</p>}
              <div className="grid grid-cols-2 gap-y-2.5">
                {[
                  { icon: Star,        val: formatNumber(issue.repo.stars || 0),          label: 'Stars',    color: 'text-apple-yellow' },
                  { icon: GitFork,     val: formatNumber(issue.repo.forks || 0),          label: 'Forks',    color: 'text-apple-teal'   },
                  { icon: AlertCircle, val: formatNumber(issue.repo.openIssuesCount || 0),label: 'Open',     color: 'text-apple-orange' },
                ].map(({ icon: Icon, val, label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                    <Icon size={12} className={color} /> {val} {label}
                  </div>
                ))}
                {issue.repo.language && (
                  <div className="flex items-center gap-1.5 text-xs text-apple-blue">
                    <span className="w-2 h-2 rounded-full bg-apple-blue" /> {issue.repo.language}
                  </div>
                )}
              </div>
              <a href={issue.repo.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-apple-blue text-xs mt-4 hover:underline">
                View repo <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
