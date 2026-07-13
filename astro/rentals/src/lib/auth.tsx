import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getCurrentMember, isLoggedIn, login as doLogin, logout as doLogout } from './wix-client';

export interface Member {
  id?: string;
  name?: string;
  email?: string;
  photo?: string;
}

interface AuthValue {
  member: Member | null;
  loggedIn: boolean;
  loading: boolean;
  login: (returnTo?: string) => Promise<void>;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(isLoggedIn());

  const refresh = useCallback(() => {
    if (!isLoggedIn()) {
      setMember(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getCurrentMember()
      .then((m) => setMember(m))
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: AuthValue = {
    member,
    loggedIn: isLoggedIn(),
    loading,
    login: (returnTo) =>
      doLogin(returnTo).catch((e) => {
        // eslint-disable-next-line no-console
        console.error('[auth] login failed', e);
        // Re-throw so callers can clear their pending/loading UI. On success the
        // browser redirects away, so the promise never visibly resolves.
        throw e;
      }),
    logout: () => {
      doLogout().catch((e) => {
        // eslint-disable-next-line no-console
        console.error('[auth] logout failed', e);
      });
    },
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
