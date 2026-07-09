import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Bug fix: button used to hardcode '/discovery' for everyone. A logged-out
  // visitor clicking it would get bounced through RequireOnboarded back to
  // "/" anyway — an unnecessary extra redirect. Now it sends each visitor
  // straight to wherever they actually belong.
  let target = '/';
  let label  = 'Go Home';
  if (isAuthenticated) {
    target = user?.onboardingComplete ? '/dashboard' : '/onboarding';
    label  = user?.onboardingComplete ? 'Go to Dashboard' : 'Finish Setup';
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ backgroundColor: 'var(--c-bg)' }}>
      {/* Bug fix: text-white/[0.04] was invisible against a light background.
          Replaced with a theme-aware fill that stays subtle in both themes. */}
      <p
        className="text-8xl font-bold mb-4 select-none"
        style={{ color: 'var(--c-fill-2)' }}
      >
        404
      </p>
      <h1 className="text-ink-primary text-lg font-semibold mb-2">Page not found</h1>
      <p className="text-ink-tertiary text-sm mb-8">This page doesn't exist or was moved.</p>
      <button onClick={() => navigate(target)} className="btn-primary text-sm">
        {label}
      </button>
    </div>
  );
}
