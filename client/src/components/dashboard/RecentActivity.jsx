import { useNavigate } from 'react-router-dom';
import { statusColors, timeAgo, truncate } from '../../utils/formatters';

export default function RecentActivity({ items = [] }) {
  const navigate = useNavigate();

  if (!items.length) return (
    <p className="text-xs text-center py-8" style={{ color: 'var(--c-text-4)' }}>
      No recent activity
    </p>
  );

  return (
    <div className="space-y-1">
      {items.map(item => {
        const number = item.githubIssueUrl?.split('/').pop();
        const [owner, repo] = (item.repoFullName || '').split('/');

        function go() {
          if (owner && repo && number && !isNaN(number))
            navigate(`/issue/${owner}/${repo}/${number}`);
        }

        return (
          <div
            key={item._id}
            onClick={go}
            // Bug fix: hover:bg-white/[0.04] → hover-fill (CSS-var-based)
            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover-fill cursor-pointer transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate transition-colors group-hover:text-apple-blue"
                style={{ color: 'var(--c-text-2)' }}
              >
                {truncate(item.issueTitle, 60)}
              </p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--c-text-4)' }}>
                {item.repoFullName}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={`tag text-[10px] ${statusColors(item.status)}`}>
                {item.status}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--c-text-4)' }}>
                {timeAgo(item.updatedAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
