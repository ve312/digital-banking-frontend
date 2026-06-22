import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { loginRequest } from '../api/authService';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

function getInitialUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

function getInitialToken() {
  try {
    const stored = localStorage.getItem('token');
    return stored && stored.length > 10 ? stored : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(getInitialToken);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitializing(false);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await loginRequest(credentials);
      const { token: jwt, username, rol } = data;
      const userData = { username, rol };
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const session = useMemo(() => ({
    user,
    token,
    loading,
    initializing,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.rol === 'ADMIN',
    isAsesor: user?.rol === 'ASESOR',
    isAuditor: user?.rol === 'AUDITOR',
    userRol: user?.rol || null,
  }), [user, token, loading, initializing, login, logout]);

  return (
    <AuthContext.Provider value={session}>
      {children}
    </AuthContext.Provider>
  );
}
