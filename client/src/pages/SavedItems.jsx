import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, LayoutGrid, List } from 'lucide-react';
import SavedIssueCard from '../components/tracking/SavedIssueCard';
import { EmptyState, ErrorMessage, Pagination, PageHeader } from '../components/ui/index';
import { savedItemsApi, dashboardApi } from '../api/index';   // ← BUG FIX: static import
import { useToast } from '../context/ToastContext';

const TABS = ['All', 'Saved', 'Exploring', 'In Progress', 'PR Opened', 'Merged', 'Dropped'];

export default function SavedItems() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');
  const [view,      setView]      = useState('grid');
  const [page,      setPage]      = useState(1);

  const statusParam = activeTab === 'All' ? undefined : activeTab;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['savedItems', statusParam, page],
    queryFn:  () => savedItemsApi.getAll(statusParam ? { status: statusParam, page } : { page }),
  });

  // Tab counts from dashboard summary
  const { data: summaryData } = useQuery({
    queryKey:  ['dashboard', 'summary'],
    queryFn:   dashboardApi.getSummary,
    staleTime: 1000 * 30,
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

  function handleStatusChange(id, status) { updateMutation.mutate({ id, body: { status } }); }
  function handleNoteChange(id, note)     { updateMutation.mutate({ id, body: { note   } }); }
  function handleRemove(id)               { removeMutation.mutate(id); }

  const items = data?.data?.items || [];
  const total = data?.data?.total  || 0;

  return (
    <div>
      <PageHeader
        title="Saved Issues"
        subtitle="Track every opportunity from discovery to merged PR"
        action={
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'var(--c-fill-3)', border: '1px solid var(--glass-border)' }}
          >
            {[
              { id: 'grid', Icon: LayoutGrid },
              { id: 'list', Icon: List },
            ].map(({ id, Icon }) => (
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
        }
      />

      {/* Status tabs */}
      <div
        className="flex gap-1 flex-wrap mb-6 pb-4 border-b"
        style={{ borderColor: 'var(--c-sep)' }}
      >
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

      {/* Content */}
      {isLoading && (
        <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass h-44 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorMessage message={error?.response?.data?.message || 'Failed to load saved items'} onRetry={refetch} />
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
                onStatusChange={handleStatusChange}
                onNoteChange={handleNoteChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
          <Pagination page={page} totalCount={total} perPage={20} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
