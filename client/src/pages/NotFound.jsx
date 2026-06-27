import { useNavigate } from 'react-router-dom';
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-sys-bg flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-white/[0.04] mb-4 select-none">404</p>
      <h1 className="text-ink-primary text-lg font-semibold mb-2">Page not found</h1>
      <p className="text-ink-tertiary text-sm mb-8">This page doesn't exist or was moved.</p>
      <button onClick={() => navigate('/discovery')} className="btn-primary text-sm">Go to Discovery</button>
    </div>
  );
}
