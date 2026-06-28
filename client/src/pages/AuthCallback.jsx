import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UpstreamWordmark } from '../components/ui/Logo';

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const done      = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error || !token) {
      navigate('/?error=auth_failed', { replace: true });
      return;
    }

    // login() fetches /auth/me in the background; we wait for it before redirecting
    login(token).then(fullUser => {
      navigate(fullUser?.onboardingComplete ? '/discovery' : '/onboarding', { replace: true });
    }).catch(() => {
      // Fallback: if /auth/me fails, go to onboarding (safe default)
      navigate('/onboarding', { replace: true });
    });
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: 'var(--c-bg)' }}
    >
      <UpstreamWordmark size={32} />
      <div className="flex items-center gap-1.5">
        {[0, 150, 300].map(delay => (
          <div
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-apple-blue animate-bounce-dot"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: 'var(--c-text-4)' }}>Signing you in...</p>
    </div>
  );
}
