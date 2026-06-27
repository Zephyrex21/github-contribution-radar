import { useQuery } from '@tanstack/react-query';
import { Bookmark, Zap, GitMerge, XCircle, Flame } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import Heatmap from '../components/dashboard/Heatmap';
import { SkeletonCard, ErrorMessage, PageHeader } from '../components/ui/index';
import { dashboardApi } from '../api/index';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
  });

  const { data: heatData } = useQuery({
    queryKey: ['dashboard', 'heatmap'],
    queryFn: dashboardApi.getHeatmap,
  });

  const s = data?.data;
  const heatmap = heatData?.data?.heatmap || [];
  const streak  = heatData?.data?.streak  || 0;

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 skeleton rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass h-28" />)}
      </div>
      <div className="glass h-64" />
    </div>
  );

  if (isError) return <ErrorMessage message={error?.response?.data?.message || 'Failed to load dashboard'} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user?.username ? user.username + "'s" : 'Your'} Dashboard`}
        subtitle="Your open-source contribution pipeline"
        action={
          streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-apple-orange"
              style={{ background: 'rgba(255,159,10,0.10)', border: '1px solid rgba(255,159,10,0.2)' }}>
              <Flame size={13} className="animate-pulse-slow" />
              {streak}-day streak
            </div>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Saved"  value={s?.totalSaved ?? 0} icon={Bookmark}  color="text-apple-blue"   />
        <StatCard label="Active"       value={s?.active    ?? 0} icon={Zap}        color="text-apple-orange" />
        <StatCard label="Merged"       value={s?.merged    ?? 0} icon={GitMerge}   color="text-apple-green"  />
        <StatCard label="Dropped"      value={s?.dropped   ?? 0} icon={XCircle}    color="text-apple-red"    />
      </div>

      {/* Heatmap */}
      <div className="glass p-6">
        <Heatmap data={heatmap} />
      </div>

      {/* Status chart + Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-6">
          <p className="section-label mb-5">Breakdown by status</p>
          <StatusPieChart byStatus={s?.byStatus || {}} />
        </div>
        <div className="glass p-6">
          <p className="section-label mb-4">Recent activity</p>
          <RecentActivity items={s?.recentActivity || []} />
        </div>
      </div>
    </div>
  );
}
