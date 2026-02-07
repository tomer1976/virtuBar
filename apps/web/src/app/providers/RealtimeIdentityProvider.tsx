import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useProfile } from './ProfileProvider';
import { RealtimeUserIdentity } from '../../net/realtime/types';
import { resetRealtimeIdentity, resolveRealtimeIdentity } from '../../net/realtime/identity';

type RealtimeIdentityContextValue = {
  identity: RealtimeUserIdentity;
  resetIdentity: () => void;
};

const RealtimeIdentityContext = createContext<RealtimeIdentityContextValue | undefined>(undefined);

export function RealtimeIdentityProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const identity = useMemo(
    () => resolveRealtimeIdentity(profile, user, { search: location.search }),
    [location.search, profile, user],
  );

  const value = useMemo<RealtimeIdentityContextValue>(
    () => ({ identity, resetIdentity: resetRealtimeIdentity }),
    [identity],
  );

  return <RealtimeIdentityContext.Provider value={value}>{children}</RealtimeIdentityContext.Provider>;
}

export function useRealtimeIdentity(): RealtimeIdentityContextValue {
  const ctx = useContext(RealtimeIdentityContext);
  if (!ctx) {
    throw new Error('useRealtimeIdentity must be used within RealtimeIdentityProvider');
  }
  return ctx;
}
