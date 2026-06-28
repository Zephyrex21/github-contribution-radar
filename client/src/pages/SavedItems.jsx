import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, LayoutGrid, List, Download } from 'lucide-react';
import SavedIssueCard from '../components/tracking/SavedIssueCard';
import { EmptyState, ErrorMessage, Pagination, PageHeader } from '../components/ui/index';
import { savedItemsApi, dashboardApi } from '../api/index';
import { useToast } from '../context/ToastContext';

const TABS = ['All', 'Saved', 'Exploring', 'In Progress', 'PR Opened', 'Merged', 'Dropped'];

function exportCSV(items) {
  const header = ['Title', 'Repo', 'Status', 'Difficulty', 'Language', 'Score', 'Note', 'Saved At', 'GitHub URL'];
  const rows   = items.map(i => [
    `"${(i.issueTitle || '').replace(/"/g, '""')}"`,
    i.repoFullName || '',
    i.status       || '',
    i.difficultyTag|| '',
    i.language     || '',
    i.score        || '',
    `"${(i.note || '').replace(/"/g, '""')}"`,
    i.savedAt ? new Date(i.savedAt).toLocaleDateString() : '',
    i.githubIssueUrl || '',
  ]);
  const csv  = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `upstream-saved-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SavedItems() {
  const toast  = useToast();
  const qc     = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');
  const [view,      setView]      = useState('grid');
  const [page,      setPage]      = useState(1);

  const statusParam = activeTab === 'All' ? undefined : activeTab;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['savedItems', statusParam, page],
    queryFn:  () => savedItemsApi.getAll(statusParam ? { status: statusParam, page } : { page }),
  });

  const { data: summaryData } = useQuery({
    queryKey:  ['dashboard', 'summary'],
    queryFn:   dashboardApi.getSummary,
    staleTime: 1000 * 30,
  });

  // For CSV export — fetch ALL items (no pagination)
  const { data: allData } = useQuery({
    queryKey:  ['savedItems', 'all-export'],
    queryFn:   () => savedItemsApi.getAll({ page: 1 }),
    staleTime: 1000 * 60,
  });

  const byStatus = summaryData?.data?.byStatus || {};
  const counts   = {
    All: Object.values(byStatus).reduce((a, b) => a + b, 0),
    ...byStatus,
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => savedItemsApi.update(id, body),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['savedItems'] }),
  });
  const removeMutation = useMutation({
    mutationFn: savedItemsApi.remove,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['savedItems'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Issue removed');
    },
  });

  const items = data?.data?.items || [];
  const total = data?.data?.total  || 0;

  return (
    <div>
      <PageHeader
        title="Saved Issues"
        subtitle="Track every opportunity from discovery to merged PR"
        action={
          <div className="flex items-center gap-2">
            {/* Export CSV */}
            <button
              onClick={() => {
                const all = allData?.data?.items || items;
                if (!all.length) { toast.info('Nothing to export yet'); return; }
                exportCSV(all);
                toast.success('CSV exported');
              }}
              className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2"
              title="Export as CSV"
            >
              <Download size={13} />
              Export
            </button>

            {/* Grid / List toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: 'var(--c-fill-3)', border: '1px solid var(--glass-border)' }}
            >
              {[{ id: 'grid', Icon: LayoutGrid }, { id: 'list', Icon: List }].map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    background: view === id ? 'var(--c-fill-2)' : 'transparent',
                    color:      view === id ? 'var(--c-text-1)' : 'var(--c-text-4)',
                  }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap mb-6 pb-4 border-b" style={{ borderColor: 'var(--c-sep)' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
            style={{
              background: activeTab === tab ? 'var(--c-fill-2)' : 'transparent',
              color:      activeTab === tab ? 'var(--c-text-1)' : 'var(--c-text-4)',
              border:     activeTab === tab ? '1px solid var(--glass-border)' : '1px solid transparent',
            }}
          >
            {tab}
            {counts[tab] > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md"
                style={{
                  background: activeTab === tab ? 'rgba(10,132,255,0.15)' : 'var(--c-fill-3)',
                  color:      activeTab === tab ? 'var(--c-accent)' : 'var(--c-text-4)',
                }}
              >
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass h-44 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorMessage message={error?.response?.data?.message || 'Failed to load'} onRetry={refetch} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={Bookmark}
          message="Nothing here yet"
          subMessage={
            activeTab === 'All'
              ? 'Save issues from Discovery to start tracking them here.'
              : `No issues with status "${activeTab}".`
          }
          actionLabel={activeTab !== 'All' ? 'View all' : undefined}
          onAction={activeTab !== 'All' ? () => setActiveTab('All') : undefined}
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>
            {items.map(item => (
              <SavedIssueCard
                key={item._id}
                item={item}
                onStatusChange={(id, status) => updateMutation.mutate({ id, body: { status } })}
                onNoteChange={(id, note)     => updateMutation.mutate({ id, body: { note   } })}
                onRemove={id => removeMutation.mutate(id)}
              />
            ))}
          </div>
          <Pagination page={page} totalCount={total} perPage={20} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
