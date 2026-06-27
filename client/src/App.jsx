import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import Discovery from './pages/Discovery';
import IssueDetail from './pages/IssueDetail';
import Dashboard from './pages/Dashboard';
import SavedItems from './pages/SavedItems';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-1.5 h-1.5 rounded-full bg-apple-blue animate-bounce" style={{ animationDelay: '0ms' }} />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/issue/:owner/:repo/:issueNumber" element={<IssueDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/saved" element={<SavedItems />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
