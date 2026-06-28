import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, GitFork, AlertCircle, ExternalLink } from 'lucide-react';
import IssueCard from '../components/discovery/IssueCard';
import { SkeletonCard, EmptyState, ErrorMessage, PageHeader } from '../components/ui/index';
import { issuesApi, savedItemsApi } from '../api/index';
import { useToast } from '../context/ToastContext';
import { formatNumber } from '../utils/formatters';

export default function RepoIssues() {
  const { owner, repo } = useParams();
  const navigate        = useNavigate();
  const toast           = useToast();
  const qc              = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['repo-issues', owner, repo],
    queryFn:  () => issuesApi.getRepoIssues(owner, repo),
    staleTime: 1000 * 60 * 5,
  });

  const saveMutation = useMutation({
    mutationFn: savedItemsApi.save,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['repo-issues', owner, repo] }); toast.success('Issue saved'); },
    onError:    e  => toast.error(e?.response?.data?.message || 'Could not save issue'),
  });

  function handleSave(issue) {
    saveMutation.mutate({
      githubIssueId:  issue.githubIssueId,
      issueTitle:     issue.title,
      repoFullName:   issue.repoFullName || `${owner}/${repo}`,
      githubIssueUrl: issue.url,
      difficultyTag:  issue.difficultyTag,
      language:       issue.language || data?.data?.repo?.language,
      score:          issue.score,
    });
  }

  const items    = data?.data?.items || [];
  const repoInfo = data?.data?.repo;

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

      {/* Repo header */}
      {repoInfo && (
        <div className="glass p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold" style={{ color: 'var(--c-text-1)' }}>
                  {repoInfo.fullName}
                </h1>
                {repoInfo.language && (
                  <span className="tag text-xs" style={{ background: 'rgba(10,132,255,0.10)', color: 'var(--c-accent)' }}>
                    {repoInfo.language}
                  </span>
                )}
              </div>
              {repoInfo.description && (
                <p className="text-sm mb-3" style={{ color: 'var(--c-text-3)' }}>{repoInfo.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--c-text-4)' }}>
                <span className="flex items-center gap-1.5">
                  <Star size={12} className="text-apple-yellow" />
                  {formatNumber(repoInfo.stars || 0)}
                </span>
                <span className="flex items-center gap-1.5">
                  <GitFork size={12} />
                  {formatNumber(repoInfo.forks || 0)}
                </span>
                <span className="flex items-center gap-1.5">
                  <AlertCircle size={12} className="text-apple-orange" />
                  {formatNumber(repoInfo.openIssuesCount || 0)} open
                </span>
              </div>
            </div>
            <a
              href={repoInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs flex-shrink-0"
            >
              <ExternalLink size={13} />
              View on GitHub
            </a>
          </div>
        </div>
      )}

      {/* Results label */}
      {!isLoading && items.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--c-text-4)' }}>
          {items.length} open issues in {owner}/{repo}
        </p>
      )}

      {/* States */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {!isLoading && isError && (
        <ErrorMessage message={error?.response?.data?.message || 'Failed to load issues'} onRetry={refetch} />
      )}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={AlertCircle}
          message="No open issues"
          subMessage={`${owner}/${repo} has no open issues right now`}
        />
      )}

      {/* Grid */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(issue => (
            <IssueCard key={issue.githubIssueId} issue={issue} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  );
}
