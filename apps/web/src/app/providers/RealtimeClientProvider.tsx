import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import {
  createRealtimeProvider,
  RealtimeProviderKind,
  resolveRealtimeDebugOptions,
  resolveRealtimeProviderKind,
} from '../../net/realtime/providerFactory';
import { RealtimeProvider } from '../../net/realtime/types';
import { useFeatureFlags } from './FeatureFlagsProvider';

type RealtimeContextValue = {
  provider: RealtimeProvider;
  kind: RealtimeProviderKind;
};

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

export function RealtimeClientProvider({ children }: PropsWithChildren) {
  const flags = useFeatureFlags();

  const kind = useMemo(
    () => resolveRealtimeProviderKind(import.meta.env, { forceSim: flags.USE_MOCK_REALTIME }),
    [flags.USE_MOCK_REALTIME],
  );

  const debugOptions = useMemo(() => resolveRealtimeDebugOptions(import.meta.env), []);

  const provider = useMemo(() => createRealtimeProvider(kind, debugOptions), [kind, debugOptions]);

  useEffect(() => {
    return () => {
      provider.disconnect().catch(() => {
        // Ignore disconnect errors during teardown
      });
    };
  }, [provider]);

  const value = useMemo<RealtimeContextValue>(() => ({ provider, kind }), [provider, kind]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeClient(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error('useRealtimeClient must be used within RealtimeClientProvider');
  }
  return ctx;
}
