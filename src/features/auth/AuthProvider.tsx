import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AUTH_EXPIRED_EVENT, api, apiConfigured, tokenStore } from '../../lib/api';
import { AuthContext, type User } from './authContext';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(() => apiConfigured && tokenStore.get() !== null);

  // Restore the session from a stored token.
  useEffect(() => {
    if (!checking) return;
    api<{ user: User }>('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, [checking]);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    tokenStore.set(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    // Clear locally even if the server can't be reached.
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, checking, login, logout }), [user, checking, login, logout]);
  return <AuthContext value={value}>{children}</AuthContext>;
}
