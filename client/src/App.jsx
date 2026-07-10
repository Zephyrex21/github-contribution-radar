import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout       from './components/layout/Layout';
import Landing      from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import Onboarding   from './pages/Onboarding';
import Discovery    from './pages/Discovery';
import IssueDetail  from './pages/IssueDetail';
import RepoIssues   from './pages/RepoIssues';
import Dashboard    from './pages/Dashboard';
import SavedItems   from './pages/SavedItems';
import Profile      from './pages/Profile';
import NotFound     from './pages/NotFound';

/** Shared loading dots — used everywhere the app is resolving auth state */
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--c-bg)' }}>
      <div className="flex items-center gap-1.5">
        {[0, 150, 300].map(d => (
          <div
            key={d}
            className="w-1.5 h-1.5 rounded-full bg-apple-blue"
            style={{ animation: `bounceDot 1.4s ease-in-out ${d}ms infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Root route ("/") — decides BEFORE rendering anything heavy whether to show
 * the marketing Landing page or bounce an already-authenticated user straight
 * to their app.
 *
 * Bug fixed: previously <Landing /> always mounted first (full animated
 * preview, ambient background, timers) and only redirected via a useEffect
 * after mount — every returning logged-in user saw a flash of the marketing
 * page before being kicked to /discovery. This component checks auth state
 * synchronously in render, so a logged-in user never sees Landing at all.
 */
function RootRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <AuthLoading />;

  if (isAuthenticated) {
    // Fully onboarded users land on their Dashboard (their "home").
    // Users mid-onboarding are sent to finish setup first.
    return <Navigate to={user?.onboardingComplete ? '/discovery' : '/onboarding'} replace />;
  }

  return <Landing />;
}

/** Gate for /onboarding — only requires auth, not onboarding completion (this IS that step) */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoading />;
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

/**
 * Gate for the main app (Discovery, Dashboard, Saved, Profile, etc.)
 * Bug fixed: previously only checked isAuthenticated. A user who completed
 * GitHub OAuth but closed the tab before finishing the preferences wizard
 * could navigate directly to any protected URL and skip onboarding entirely.
 * This now also enforces onboardingComplete, same as the root-route logic.
 */
function RequireOnboarded({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!user?.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Root — Landing for guests, instant redirect for authenticated users */}
      <Route path="/"              element={<RootRoute />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Onboarding — auth required, but this is the onboarding step itself */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      {/* Main app — auth AND completed onboarding required */}
      <Route element={<RequireOnboarded><Layout /></RequireOnboarded>}>
        <Route path="/discovery"                       element={<Discovery />}  />
        <Route path="/issue/:owner/:repo/:issueNumber" element={<IssueDetail />} />
        <Route path="/repo/:owner/:repo"               element={<RepoIssues />}  />
        <Route path="/dashboard"                       element={<Dashboard />}   />
        <Route path="/saved"                           element={<SavedItems />}  />
        <Route path="/profile"                         element={<Profile />}     />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
