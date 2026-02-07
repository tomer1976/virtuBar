import { createRateLimitedProvider } from './rateLimitedProvider';
import { createSimProvider } from './simProvider';
import { RealtimeProvider } from './types';

export type RealtimeProviderKind = 'sim' | 'ws';

function normalizeProvider(raw: unknown): RealtimeProviderKind {
  if (typeof raw !== 'string') return 'sim';
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'ws') return 'ws';
  return 'sim';
}

export function resolveRealtimeProviderKind(
  env: Record<string, unknown>,
  options?: { forceSim?: boolean },
): RealtimeProviderKind {
  if (options?.forceSim) return 'sim';
  const raw = env.VITE_REALTIME_PROVIDER ?? env.REALTIME_PROVIDER;
  return normalizeProvider(raw);
}

export function createRealtimeProvider(kind: RealtimeProviderKind): RealtimeProvider {
  const base = kind === 'sim' ? createSimProvider() : createSimProvider();
  if (kind === 'ws') {
    console.warn('REALTIME_PROVIDER=ws is not implemented yet; falling back to simulation provider');
  }
  return createRateLimitedProvider(base);
}
