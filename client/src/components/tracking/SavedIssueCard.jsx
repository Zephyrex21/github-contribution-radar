import { ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusSelector from './StatusSelector';
import NotesEditor    from './NotesEditor';
import ScoreBadge     from '../discovery/ScoreBadge';
import { timeAgo }    from '../../utils/formatters';

const DIFF = {
  Beginner: 'bg-apple-green/12 text-apple-green',
  Moderate: 'bg-apple-yellow/12 text-apple-yellow',
  Advanced: 'bg-apple-red/12 text-apple-red',
};

export default function SavedIssueCard({ item, onStatusChange, onNoteChange, onRemove }) {
  const navigate = useNavigate();

  function go() {
    const [owner, repo] = (item.repoFullName || '').split('/');
    const n = item.githubIssueUrl?.split('/').pop();
    if (owner && repo && n && !isNaN(n)) navigate(`/issue/${owner}/${repo}/${n}`);
    else window.open(item.githubIssueUrl, '_blank');
  }

  return (
    // Bug fix: hover:bg-white/[0.06] → hover-fill (CSS-var-based)
    <div className="glass p-4 hover-fill transition-all duration-200">

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <button
          onClick={go}
          className="text-xs font-semibold transition-colors text-left leading-snug flex-1"
          style={{ color: 'var(--c-text-2)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#0a84ff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-2)'}
        >
          {item.issueTitle}
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          <a
            href={item.githubIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-2)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
          >
            <ExternalLink size={12} />
          </a>
          <button
            onClick={() => onRemove(item._id)}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff453a'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <p className="text-[10px] font-mono mb-3" style={{ color: 'var(--c-text-4)' }}>
        {item.repoFullName}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {item.score !== undefined && (
          <ScoreBadge
            score={item.score}
            scoreBand={
              item.score >= 80 ? 'Strong Match' :
              item.score >= 50 ? 'Possible Match' : 'Low Match'
            }
          />
        )}
        {item.difficultyTag && (
          // Bug fix: fallback was bg-white/[0.06] → now bg-fill-tertiary
          <span className={`tag text-[10px] ${DIFF[item.difficultyTag] || 'bg-fill-tertiary text-ink-tertiary'}`}>
            {item.difficultyTag}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StatusSelector value={item.status} onChange={s => onStatusChange(item._id, s)} />
        <span className="text-[10px] ml-auto" style={{ color: 'var(--c-text-4)' }}>
          Saved {timeAgo(item.savedAt)}
        </span>
      </div>

      <NotesEditor itemId={item._id} initialNote={item.note} onSave={onNoteChange} />
    </div>
  );
}
