import { useQuery } from '@tanstack/react-query';
import { Bookmark, Zap, GitMerge, Flame, Trophy } from 'lucide-react';
import StatCard            from '../components/dashboard/StatCard';
import StatusPieChart      from '../components/dashboard/StatusPieChart';
import RecentActivity      from '../components/dashboard/RecentActivity';
import Heatmap             from '../components/dashboard/Heatmap';
import PipelineView        from '../components/dashboard/PipelineView';
import LanguageBreakdown   from '../components/dashboard/LanguageBreakdown';
import GoalWidget          from '../components/dashboard/GoalWidget';
import { ErrorMessage, PageHeader } from '../components/ui/index';
import { dashboardApi }    from '../api/index';
import { useAuth }         from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn:  dashboardApi.getSummary,
  });

  const { data: heatData } = useQuery({
    queryKey: ['dashboard', 'heatmap'],
    queryFn:  dashboardApi.getHeatmap,
  });

  const s       = data?.data;
  const heatmap = heatData?.data?.heatmap || [];
  const streak  = heatData?.data?.streak  || 0;

  if (isLoading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-7 w-48 skeleton rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="glass h-28" />)}
      </div>
      <div className="glass h-40" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="glass h-48" />)}
      </div>
    </div>
  );

  if (isError) return (
    <ErrorMessage message={error?.response?.data?.message || 'Failed to load dashboard'} onRetry={refetch} />
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title={`${user?.username ? user.username + "'s" : 'Your'} Dashboard`}
        subtitle="Your open-source contribution pipeline"
        action={
          streak > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: 'rgba(255,159,10,0.10)',
                border: '1px solid rgba(255,159,10,0.20)',
                color: '#ff9f0a',
              }}
            >
              <Flame size={13} style={{ animation: 'pulse 2s infinite' }} />
              {streak}-day streak
            </div>
          )
        }
      />

      {/* ── Row 1: Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Saved"   value={s?.totalSaved ?? 0}
          icon={Bookmark}       color="text-apple-blue"
          delta={s?.thisWeekSaved}
        />
        <StatCard
          label="Active"        value={s?.active ?? 0}
          icon={Zap}            color="text-apple-orange"
        />
        <StatCard
          label="Merged"        value={s?.merged ?? 0}
          icon={GitMerge}       color="text-apple-green"
        />
        <StatCard
          label="Success Rate"  value={s?.successRate ?? 0}
          icon={Trophy}         color="text-apple-purple"
          suffix="%"
        />
      </div>

      {/* ── Row 2: Activity heatmap ── */}
      <div className="glass p-6">
        <Heatmap data={heatmap} />
      </div>

      {/* ── Row 3: Pipeline (full width) ── */}
      <div className="glass p-6">
        <p className="section-label mb-4">Contribution pipeline</p>
        <PipelineView byStatus={s?.byStatus || {}} />
      </div>

      {/* ── Row 4: Language · Status · Goal ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="glass p-5">
          <p className="section-label mb-4">By language</p>
          <LanguageBreakdown data={s?.languageBreakdown || []} />
        </div>

        <div className="glass p-5">
          <p className="section-label mb-5">By status</p>
          <StatusPieChart byStatus={s?.byStatus || {}} />
        </div>

        <GoalWidget merged={s?.merged ?? 0} />

      </div>

      {/* ── Row 5: Recent activity ── */}
      <div className="glass p-6">
        <p className="section-label mb-4">Recent activity</p>
        <RecentActivity items={s?.recentActivity || []} />
      </div>
    </div>
  );
}
