import { createContext, use } from 'react';

export interface User {
  id: number;
  username: string;
}

export interface AuthState {
  user: User | null;
  /** True until a stored token has been checked with the server. */
  checking: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const auth = use(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>');
  return auth;
}
