import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ExternalLink, Eye } from 'lucide-react';
import ScoreBadge from './ScoreBadge';
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
    e.stopPropagation();
    if (owner && repo && issue.number) navigate(`/issue/${owner}/${repo}/${issue.number}`);
    else window.open(issue.url, '_blank');
  }

  function handleSave(e) {
    e.stopPropagation();
    onSave?.(issue);
  }

  return (
    <>
      <article
        className="glass group relative cursor-pointer transition-all duration-200
          hover:bg-white/[0.07] hover:border-white/[0.12] hover:shadow-glass hover:-translate-y-0.5"
        onClick={goToDetail}
      >
        {/* Accent line at top for strong matches */}
        {issue.score >= 80 && (
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-apple-blue/50 to-transparent rounded-full" />
        )}

        <div className="p-5">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <ScoreBadge score={issue.score} scoreBand={issue.scoreBand} />
              {issue.difficultyTag && (
                <span className={`tag text-xs ${DIFF_COLORS[issue.difficultyTag] || 'bg-white/[0.06] text-ink-tertiary'}`}>
                  {issue.difficultyTag}
                </span>
              )}
            </div>
            {/* Action buttons — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button onClick={e => { e.stopPropagation(); setPreview(true); }}
                className="p-1.5 rounded-lg text-ink-quaternary hover:text-ink-secondary hover:bg-white/[0.06] transition-colors"
                title="Quick preview">
                <Eye size={14} />
              </button>
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-lg transition-all ${
                  issue.isSaved
                    ? 'text-apple-blue bg-apple-blue/10'
                    : 'text-ink-quaternary hover:text-apple-blue hover:bg-apple-blue/10'
                }`}
                title={issue.isSaved ? 'Saved' : 'Save'}
              >
                {issue.isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              </button>
              <a href={issue.url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-lg text-ink-quaternary hover:text-ink-secondary hover:bg-white/[0.06] transition-colors"
                title="Open on GitHub">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-ink-primary text-sm leading-snug mb-1.5 group-hover:text-apple-blue transition-colors">
            {truncate(issue.title, 90)}
          </h3>

          {/* Repo */}
          <p className="text-ink-quaternary text-xs font-mono mb-3">
            {issue.repoFullName}
            {issue.language && <span className="ml-2 text-apple-blue/60">· {issue.language}</span>}
          </p>

          {/* Labels */}
          {issue.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {issue.labels.slice(0, 3).map(l => (
                <span key={l} className={`tag text-xs ${labelColors(l)}`}>{l}</span>
              ))}
              {issue.labels.length > 3 && (
                <span className="tag text-xs bg-white/[0.04] text-ink-quaternary">+{issue.labels.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-ink-quaternary text-xs">Updated {timeAgo(issue.updatedAt)}</span>
            {issue.isSaved && (
              <span className="flex items-center gap-1 text-apple-blue text-xs">
                <BookmarkCheck size={11} /> Saved
              </span>
            )}
          </div>
        </div>
      </article>

      {preview && owner && repo && issue.number && (
        <QuickPreviewModal owner={owner} repo={repo} issueNumber={issue.number} onClose={() => setPreview(false)} />
      )}
    </>
  );
}
