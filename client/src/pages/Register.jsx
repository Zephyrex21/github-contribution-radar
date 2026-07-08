import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UpstreamWordmark } from '../components/ui/Logo';

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters',  pass: password.length >= 8 },
    { label: 'Uppercase',      pass: /[A-Z]/.test(password) },
    { label: 'Number',         pass: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-2">
      {checks.map(({ label, pass }) => (
        <span key={label} className={`flex items-center gap-1 text-[10px] ${pass ? 'text-apple-green' : 'text-ink-tertiary'}`}>
          <Check size={9} className={pass ? 'opacity-100' : 'opacity-30'} />
          {label}
        </span>
      ))}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const { isDark }   = useTheme();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ username: '', email: '', password: '' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(form.username.trim(), form.email.trim(), form.password);
      navigate(user?.onboardingComplete ? '/dashboard' : '/onboarding', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-mesh"
      style={{ backgroundColor: 'var(--c-bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link to="/"><UpstreamWordmark size={30} /></Link>
        </div>

        <div className="glass p-7">
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--c-text-1)' }}>
            Create your account
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--c-text-3)' }}>
            Start tracking your open-source contributions
          </p>

          {error && (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-sm text-apple-red"
              style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)' }}>
                Username
              </label>
              <input
                type="text"
                required
                autoFocus
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="input-glass h-10 text-sm"
                placeholder="your_username"
                minLength={3}
                maxLength={30}
              />
              <p className="text-[10px] mt-1" style={{ color: 'var(--c-text-4)' }}>
                Letters, numbers, underscores — 3 to 30 characters
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-glass h-10 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-glass h-10 text-sm pr-10"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--c-text-4)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-2)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-10 text-sm font-semibold mt-2"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: textSecondary }}>
          Already have an account?{' '}
          <Link to="/login" className="text-apple-blue hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
