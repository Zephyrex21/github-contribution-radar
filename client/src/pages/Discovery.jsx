import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';   // ← BUG FIX: was missing
import { Telescope, Zap, TrendingUp, Search as SearchIcon } from 'lucide-react';
import SearchBar from '../components/discovery/SearchBar';
import FilterPanel from '../components/discovery/FilterPanel';
import IssueCard from '../components/discovery/IssueCard';
import { SkeletonCard, EmptyState, ErrorMessage, Pagination, PageHeader } from '../components/ui/index';
import { issuesApi, savedItemsApi } from '../api/index';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

function useDebounce(v, ms = 320) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

const TABS = [
  { id: 'foryou',   label: 'For You',  icon: Zap        },
  { id: 'trending', label: 'Trending', icon: TrendingUp  },
  { id: 'search',   label: 'Search',   icon: SearchIcon  },
];

export default function Discovery() {
  const toast = useToast();
  const qc    = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab,     setTab]     = useState('foryou');
  const [query,   setQuery]   = useState('');
  const [filters, setFilters] = useState({ language: '', label: '', sort: 'score' });
  const [page,    setPage]    = useState(1);
  const dq = useDebounce(query, 350);

  useEffect(() => setPage(1), [dq, filters, tab]);

  // For You — auto search using first preferred language
  const forYouLang = user?.preferences?.languages?.[0] || '';
  const { data: fyData,  isLoading: fyLoading,  isError: fyError  } = useQuery({
    queryKey: ['issues', 'foryou', forYouLang],
    queryFn:  () => issuesApi.search({ q: 'good first issue', language: forYouLang, label: 'good first issue', sort: 'score', page: 1 }),
    enabled:  tab === 'foryou',
    staleTime: 1000 * 60 * 10,
  });

  // Trending
  const { data: trData,  isLoading: trLoading,  isError: trError  } = useQuery({
    queryKey: ['issues', 'trending'],
    queryFn:  () => issuesApi.search({ q: 'good first issue help wanted', sort: 'score', page: 1 }),
    enabled:  tab === 'trending',
    staleTime: 1000 * 60 * 10,
  });

  // Manual search
  const { data: srData,  isLoading: srLoading,  isError: srError, refetch } = useQuery({
    queryKey: ['issues', 'search', dq, filters, page],
    queryFn:  () => issuesApi.search({ q: dq, ...filters, page }),
    enabled:  tab === 'search' && dq.trim().length > 1,
    keepPreviousData: true,
  });

  const saveMutation = useMutation({
    mutationFn: savedItemsApi.save,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['issues'] }); toast.success('Issue saved to your list'); },
    onError:   e  => toast.error(e?.response?.data?.message || 'Could not save issue'),
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

  const data       = tab === 'foryou' ? fyData    : tab === 'trending' ? trData    : srData;
  const isLoading  = tab === 'foryou' ? fyLoading : tab === 'trending' ? trLoading : srLoading;
  const isError    = tab === 'foryou' ? fyError   : tab === 'trending' ? trError   : srError;
  const items = data?.data?.items || [];
  const total = data?.data?.totalCount || 0;

  return (
    <div>
      <PageHeader
        title="Discovery"
        subtitle="Find open-source issues that match your stack"
      />

      {/* Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl mb-6 w-fit"
        style={{
          background: 'var(--c-fill-3)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
            style={{
              background:   tab === id ? 'var(--c-accent)' : 'transparent',
              color:        tab === id ? 'white' : 'var(--c-text-3)',
              boxShadow:    tab === id ? '0 0 12px rgba(10,132,255,0.3)' : 'none',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Search controls */}
      {tab === 'search' && (
        <div className="space-y-3 mb-6">
          <SearchBar value={query} onChange={setQuery} placeholder="Try 'react hooks', 'python async', 'rust cli'..." />
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* Context label */}
      {tab === 'foryou' && !isLoading && (
        <p className="text-xs mb-4" style={{ color: 'var(--c-text-4)' }}>
          Beginner-friendly issues{forYouLang ? ` in ${forYouLang}` : ''} · based on your preferences
        </p>
      )}
      {tab === 'trending' && !isLoading && (
        <p className="text-xs mb-4" style={{ color: 'var(--c-text-4)' }}>
          Active repos with beginner-friendly issues · sorted by match score
        </p>
      )}
      {tab === 'search' && dq.trim().length > 1 && !isLoading && (
        <p className="text-xs mb-4" style={{ color: 'var(--c-text-4)' }}>
          {total.toLocaleString()} results · page {page}
        </p>
      )}

      {/* Empty prompt for search tab */}
      {tab === 'search' && dq.trim().length <= 1 && (
        <EmptyState icon={SearchIcon} message="Start searching" subMessage="Type a keyword, language, or topic above" />
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorMessage message="Failed to fetch issues. Check your connection." onRetry={refetch} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        tab === 'foryou'
          ? <EmptyState icon={Zap} message="Set your preferences"
              subMessage="Go to Profile and set your preferred languages to personalise this feed."
              actionLabel="Go to Profile"
              onAction={() => navigate('/profile')} />
          : <EmptyState message="No results" subMessage="Try different keywords or clear your filters" />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(issue => (
              <IssueCard key={issue.githubIssueId} issue={issue} onSave={handleSave} />
            ))}
          </div>
          {tab === 'search' && (
            <Pagination page={page} totalCount={total} perPage={20} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
