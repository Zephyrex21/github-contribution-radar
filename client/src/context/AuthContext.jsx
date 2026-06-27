import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
        } else {
          setUser(decoded);
          api.get('/auth/me')
            .then(res => setUser(res.data.data))
            .catch(() => { localStorage.removeItem('token'); setUser(null); });
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * login(token) — stores token, decodes it, fetches full profile.
   * Returns a Promise<fullUser> so the caller can redirect after data is ready.
   */
  function login(token) {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser(decoded);

    return api.get('/auth/me')
      .then(res => {
        setUser(res.data.data);
        return res.data.data;   // ← returned to AuthCallback
      })
      .catch(() => decoded);    // fallback to JWT payload
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  function updateUser(patch) {
    setUser(prev => ({ ...prev, ...patch }));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
