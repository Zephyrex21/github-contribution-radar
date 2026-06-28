import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, TrendingUp, Search as SearchIcon, ChevronDown } from 'lucide-react';
import SearchBar   from '../components/discovery/SearchBar';
import FilterPanel from '../components/discovery/FilterPanel';
import IssueCard   from '../components/discovery/IssueCard';
import { SkeletonCard, EmptyState, ErrorMessage, Pagination, PageHeader } from '../components/ui/index';
import { issuesApi, savedItemsApi } from '../api/index';
import { useToast } from '../context/ToastContext';
import { useAuth }  from '../context/AuthContext';

function useDebounce(v, ms = 320) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

const TABS = [
  { id: 'foryou',   label: 'For You',  icon: Zap         },
  { id: 'trending', label: 'Trending', icon: TrendingUp   },
  { id: 'search',   label: 'Search',   icon: SearchIcon   },
];

export default function Discovery() {
  const toast    = useToast();
  const qc       = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync tab with URL so cmd palette search works
  const [tab,     setTab]     = useState(searchParams.get('tab') || 'foryou');
  const [query,   setQuery]   = useState(searchParams.get('q')   || '');
  const [filters, setFilters] = useState({ language: '', label: '', sort: 'score' });
  const [page,    setPage]    = useState(1);
  const [fyPage,  setFyPage]  = useState(1);
  const [trPage,  setTrPage]  = useState(1);

  const dq = useDebounce(query, 350);

  useEffect(() => setPage(1), [dq, filters]);

  // Switch to search tab when q param is present (command palette)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); setTab('search'); }
  }, [searchParams]);

  // ── For You ──────────────────────────────────────────────────────────────
  const { data: fyData, isLoading: fyLoading, isError: fyError } = useQuery({
    queryKey:  ['issues', 'foryou', fyPage],
    queryFn:   () => issuesApi.getForYou({ page: fyPage }),
    enabled:   tab === 'foryou',
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });

  // ── Trending ─────────────────────────────────────────────────────────────
  const { data: trData, isLoading: trLoading, isError: trError } = useQuery({
    queryKey:  ['issues', 'trending', trPage],
    queryFn:   () => issuesApi.getTrending({ page: trPage }),
    enabled:   tab === 'trending',
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });

  // ── Search ────────────────────────────────────────────────────────────────
  const { data: srData, isLoading: srLoading, isError: srError, refetch } = useQuery({
    queryKey:  ['issues', 'search', dq, filters, page],
    queryFn:   () => issuesApi.search({ q: dq, ...filters, page }),
    enabled:   tab === 'search' && dq.trim().length > 1,
    keepPreviousData: true,
  });

  const saveMutation = useMutation({
    mutationFn: savedItemsApi.save,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['issues'] }); toast.success('Issue saved'); },
    onError:    e  => toast.error(e?.response?.data?.message || 'Could not save issue'),
  });

  function handleSave(issue) {
    saveMutation.mutate({
      githubIssueId:  issue.githubIssueId,
      issueTitle:     issue.title,
      repoFullName:   issue.repoFullName,
      githubIssueUrl: issue.url,
      difficultyTag:  issue.difficultyTag,
      language:       issue.language,
      score:          issue.score,
    });
  }

  const data      = tab === 'foryou' ? fyData   : tab === 'trending' ? trData   : srData;
  const isLoading = tab === 'foryou' ? fyLoading: tab === 'trending' ? trLoading: srLoading;
  const isError   = tab === 'foryou' ? fyError  : tab === 'trending' ? trError  : srError;
  const items     = data?.data?.items      || [];
  const total     = data?.data?.totalCount || 0;

  // Load more
  const curPage    = tab === 'foryou' ? fyPage : trPage;
  const setTabPage = tab === 'foryou' ? setFyPage : setTrPage;
  const hasMore    = items.length >= 50; // GitHub returned a full page — likely more

  const langs = user?.preferences?.languages || [];

  return (
    <div>
      <PageHeader title="Discovery" subtitle="Find open-source issues that match your stack" />

      {/* Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl mb-6 w-fit"
        style={{ background: 'var(--c-fill-3)', border: '1px solid var(--glass-border)' }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
            style={{
              background: tab === id ? 'var(--c-accent)' : 'transparent',
              color:      tab === id ? 'white' : 'var(--c-text-3)',
              boxShadow:  tab === id ? '0 0 12px rgba(10,132,255,0.25)' : 'none',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Search tab controls */}
      {tab === 'search' && (
        <div className="space-y-3 mb-6">
          <SearchBar value={query} onChange={setQuery} placeholder="Try 'react hooks', 'python async', 'rust cli'..." />
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* Language pills for For You */}
      {tab === 'foryou' && langs.length > 1 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>Showing for:</span>
          {langs.slice(0, 5).map(l => (
            <span
              key={l}
              className="tag text-xs"
              style={{ background: 'rgba(10,132,255,0.10)', color: 'var(--c-accent)' }}
            >
              {l}
            </span>
          ))}
          {langs.length > 5 && (
            <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>+{langs.length - 5} more</span>
          )}
        </div>
      )}

      {/* Context labels */}
      {tab === 'foryou' && !isLoading && items.length > 0 && (
        <p className="text-xs mb-4" style={{ color: 'var(--c-text-4)' }}>
          {items.length} beginner-friendly issues across your preferred languages
        </p>
      )}
      {tab === 'trending' && !isLoading && items.length > 0 && (
        <p className="text-xs mb-4" style={{ color: 'var(--c-text-4)' }}>
          {items.length} active issues from popular repos · sorted by match score
        </p>
      )}
      {tab === 'search' && dq.trim().length > 1 && !isLoading && (
        <p className="text-xs mb-4" style={{ color: 'var(--c-text-4)' }}>
          {total.toLocaleString()} results · page {page}
        </p>
      )}

      {/* Empty prompt */}
      {tab === 'search' && dq.trim().length <= 1 && (
        <EmptyState icon={SearchIcon} message="Start searching"
          subMessage="Type a keyword, language, or topic above" />
      )}

      {/* Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <ErrorMessage message="Failed to fetch issues. Check your connection." onRetry={refetch} />
      )}

      {/* No results */}
      {!isLoading && !isError && items.length === 0 && (tab === 'foryou' ? (
        <EmptyState icon={Zap} message="Set your language preferences"
          subMessage="Go to Profile and select your preferred languages so we can personalise this feed."
          actionLabel="Go to Profile"
          onAction={() => navigate('/profile')} />
      ) : (
        <EmptyState message="No results"
          subMessage={tab === 'search' ? 'Try different keywords or clear filters' : 'No trending issues right now — check back soon'} />
      ))}

      {/* Grid */}
      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(issue => (
              <IssueCard key={issue.githubIssueId} issue={issue} onSave={handleSave} />
            ))}
          </div>

          {/* Load more — For You / Trending */}
          {(tab === 'foryou' || tab === 'trending') && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setTabPage(p => p + 1)}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-2 text-sm px-6"
              >
                <ChevronDown size={15} />
                Load more
              </button>
            </div>
          )}

          {/* Pagination — Search */}
          {tab === 'search' && (
            <Pagination page={page} totalCount={total} perPage={50} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
