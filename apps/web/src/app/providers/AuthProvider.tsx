import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useFeatureFlags } from './FeatureFlagsProvider';

export type MockUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: MockUser | null;
  login: () => MockUser;
  logout: () => void;
};

const STORAGE_KEY = 'virtubar:auth:user';
const mockUser: MockUser = {
  id: 'mock-user-1',
  name: 'Demo User',
  email: 'demo@virtubar.test',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockUser;
    if (parsed && typeof parsed.id === 'string') {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse stored mock user', error);
  }
  return null;
}

function writeStoredUser(user: MockUser | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to write mock user', error);
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const flags = useFeatureFlags();
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    if (!flags.USE_MOCK_AUTH) return;
    const stored = readStoredUser();
    if (stored) {
      setUser(stored);
    }
  }, [flags.USE_MOCK_AUTH]);

  const login = useCallback(() => {
    if (!flags.USE_MOCK_AUTH) {
      const disabledUser = null;
      setUser(disabledUser);
      writeStoredUser(disabledUser);
      return mockUser;
    }
    setUser(mockUser);
    writeStoredUser(mockUser);
    return mockUser;
  }, [flags.USE_MOCK_AUTH]);

  const logout = useCallback(() => {
    setUser(null);
    writeStoredUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, logout }),
    [login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export { mockUser, STORAGE_KEY as AUTH_STORAGE_KEY };
