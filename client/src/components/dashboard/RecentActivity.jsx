import { useNavigate } from 'react-router-dom';
import { statusColors, timeAgo, truncate } from '../../utils/formatters';

export default function RecentActivity({ items = [] }) {
  const navigate = useNavigate();
  if (!items.length) return <p className="text-ink-quaternary text-sm text-center py-8">No recent activity</p>;

  return (
    <div className="space-y-1">
      {items.map(item => {
        const number = item.githubIssueUrl?.split('/').pop();
        const [owner, repo] = (item.repoFullName || '').split('/');
        function go() {
          if (owner && repo && number && !isNaN(number)) navigate(`/issue/${owner}/${repo}/${number}`);
        }
        return (
          <div key={item._id} onClick={go} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink-secondary truncate group-hover:text-ink-primary transition-colors">
                {truncate(item.issueTitle, 60)}
              </p>
              <p className="text-[10px] text-ink-quaternary font-mono mt-0.5">{item.repoFullName}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={`tag text-[10px] ${statusColors(item.status)}`}>{item.status}</span>
              <span className="text-[10px] text-ink-quaternary">{timeAgo(item.updatedAt)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
