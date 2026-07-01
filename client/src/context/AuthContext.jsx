import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // ── No token → guest, done immediately ───────────────────────────────
    if (!token) {
      setIsLoading(false);
      return;
    }

    // ── Corrupt token ─────────────────────────────────────────────────────
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      localStorage.removeItem('token');
      setIsLoading(false);
      return;
    }

    // ── Expired token ─────────────────────────────────────────────────────
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      setIsLoading(false);
      return;
    }

    // ── Valid token — fetch full profile before releasing the loading gate ─
    //
    // THE FIX: previously setIsLoading(false) fired immediately after the
    // token check, BEFORE api.get('/auth/me') resolved. The JWT payload only
    // contains { userId, username, avatarUrl } — it does NOT include
    // onboardingComplete or preferences. So RootRoute would read
    // onboardingComplete:undefined and send every returning user back to
    // /onboarding, even though their profile was safely stored in MongoDB.
    //
    // Fix: keep isLoading:true until /auth/me returns. The spinner shows for
    // ~200-400ms (one round-trip to Render), then the user lands directly on
    // /dashboard with their full profile already hydrated.
    //
    // We still setUser(decoded) immediately so the avatar/name can render
    // optimistically in any UI that shows before the route resolves.
    setUser(decoded);

    api.get('/auth/me')
      .then(res => {
        setUser(res.data.data);      // full user: onboardingComplete + preferences
      })
      .catch(() => {
        // Server rejected the token or is unreachable — clear session cleanly
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);         // only NOW is it safe for RootRoute to decide
      });
  }, []);

  /**
   * login(token) — called by AuthCallback after GitHub OAuth.
   * Returns a Promise<fullUser> so the caller can navigate after data is ready.
   */
  function login(token) {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser(decoded);                // partial — avatar shows immediately

    return api.get('/auth/me')
      .then(res => {
        setUser(res.data.data);
        return res.data.data;        // AuthCallback awaits this before navigating
      })
      .catch(() => decoded);         // network failure fallback
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  function updateUser(patch) {
    setUser(prev => ({ ...prev, ...patch }));
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
