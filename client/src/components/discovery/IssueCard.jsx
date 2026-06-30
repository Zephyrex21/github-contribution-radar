import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ExternalLink, Eye } from 'lucide-react';
import ScoreBadge        from './ScoreBadge';
import QuickPreviewModal from '../global/QuickPreviewModal';
import { timeAgo, truncate, labelColors } from '../../utils/formatters';

const DIFF_COLORS = {
  Beginner: 'bg-apple-green/12 text-apple-green',
  Moderate: 'bg-apple-yellow/12 text-apple-yellow',
  Advanced: 'bg-apple-red/12 text-apple-red',
};

export default function IssueCard({ issue, onSave }) {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(false);
  const [owner, repo] = (issue.repoFullName || '').split('/');

  function goToDetail(e) {
    if (e.target.closest('[data-action]')) return;
    if (owner && repo && issue.number) navigate(`/issue/${owner}/${repo}/${issue.number}`);
    else window.open(issue.url, '_blank');
  }

  function goToRepo(e) {
    e.stopPropagation();
    if (owner && repo) navigate(`/repo/${owner}/${repo}`);
  }

  return (
    <>
      <article
        onClick={goToDetail}
        // Bug fixes:
        // hover:bg-white/[0.07]    → hover-fill-2  (CSS-var-based, theme-safe)
        // hover:border-white/[0.12] → removed      (.glass already handles border via var)
        className="glass group relative cursor-pointer transition-all duration-200 hover-fill-2 hover:-translate-y-0.5"
      >
        {/* Accent line for strong matches */}
        {issue.score >= 80 && (
          <div
            className="absolute top-0 left-4 right-4 h-px rounded-full"
            style={{ background: 'linear-gradient(to right, transparent, rgba(10,132,255,0.5), transparent)' }}
          />
        )}

        <div className="p-5">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <ScoreBadge score={issue.score} scoreBand={issue.scoreBand} />
              {issue.difficultyTag && (
                <span className={`tag text-xs ${DIFF_COLORS[issue.difficultyTag] || 'bg-fill-tertiary text-ink-tertiary'}`}>
                  {issue.difficultyTag}
                </span>
              )}
            </div>

            {/* Actions — reveal on hover */}
            <div
              data-action=""
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreview(true)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--c-text-4)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
                title="Quick preview"
              >
                <Eye size={14} />
              </button>

              <button
                onClick={() => onSave?.(issue)}
                className="p-1.5 rounded-lg transition-all"
                style={{
                  color:      issue.isSaved ? '#0a84ff' : 'var(--c-text-4)',
                  background: issue.isSaved ? 'rgba(10,132,255,0.10)' : 'transparent',
                }}
                onMouseEnter={e => { if (!issue.isSaved) e.currentTarget.style.color = '#0a84ff'; }}
                onMouseLeave={e => { if (!issue.isSaved) e.currentTarget.style.color = 'var(--c-text-4)'; }}
                title={issue.isSaved ? 'Saved' : 'Save'}
              >
                {issue.isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              </button>

              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--c-text-4)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
                title="Open on GitHub"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Title */}
          <h3
            className="font-semibold text-sm leading-snug mb-1.5 transition-colors group-hover:text-apple-blue"
            style={{ color: 'var(--c-text-1)' }}
          >
            {truncate(issue.title, 90)}
          </h3>

          {/* Repo — clickable */}
          <button
            data-action=""
            onClick={goToRepo}
            className="text-xs font-mono mb-3 transition-colors text-left hover:underline block"
            style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
          >
            {issue.repoFullName}
            {issue.language && (
              <span style={{ color: 'rgba(10,132,255,0.6)', marginLeft: 6 }}>· {issue.language}</span>
            )}
          </button>

          {/* Labels */}
          {issue.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {issue.labels.slice(0, 3).map(l => (
                <span key={l} className={`tag text-xs ${labelColors(l)}`}>{l}</span>
              ))}
              {issue.labels.length > 3 && (
                <span className="tag text-xs bg-fill-tertiary text-ink-quaternary">
                  +{issue.labels.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>
              Updated {timeAgo(issue.updatedAt)}
            </span>
            {issue.isSaved && (
              <span className="flex items-center gap-1 text-xs text-apple-blue">
                <BookmarkCheck size={11} /> Saved
              </span>
            )}
          </div>
        </div>
      </article>

      {preview && owner && repo && issue.number && (
        <QuickPreviewModal
          owner={owner} repo={repo} issueNumber={issue.number}
          onClose={() => setPreview(false)}
        />
      )}
    </>
  );
}
