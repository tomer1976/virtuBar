import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

const featureFlagKeys = [
  'USE_MOCK_AUTH',
  'USE_MOCK_PROFILE',
  'USE_MOCK_ROOMS',
  'USE_MOCK_REALTIME',
  'USE_MOCK_VOICE',
  'USE_MOCK_LIVENESS',
  'USE_MOCK_3D_SCENE',
  'ENABLE_NPC_CROWD_SIM',
] as const;

export type FeatureFlagKey = (typeof featureFlagKeys)[number];
export type FeatureFlags = Record<FeatureFlagKey, boolean>;

const defaultFeatureFlags: FeatureFlags = {
  USE_MOCK_AUTH: true,
  USE_MOCK_PROFILE: true,
  USE_MOCK_ROOMS: true,
  USE_MOCK_REALTIME: true,
  USE_MOCK_VOICE: true,
  USE_MOCK_LIVENESS: true,
  USE_MOCK_3D_SCENE: true,
  ENABLE_NPC_CROWD_SIM: true,
};

function toBoolean(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw !== 0;
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return true;
}

export function resolveFeatureFlags(env: Record<string, unknown>): FeatureFlags {
  return featureFlagKeys.reduce<FeatureFlags>((flags, key) => {
    const envKey = `VITE_${key}`;
    const raw = env[envKey];
    return { ...flags, [key]: raw === undefined ? true : toBoolean(raw) };
  }, defaultFeatureFlags);
}

const FeatureFlagsContext = createContext<FeatureFlags>(defaultFeatureFlags);

export function FeatureFlagsProvider({ children }: PropsWithChildren) {
  const flags = useMemo(() => resolveFeatureFlags(import.meta.env), []);
  return <FeatureFlagsContext.Provider value={flags}>{children}</FeatureFlagsContext.Provider>;
}

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext);
}

export { defaultFeatureFlags, featureFlagKeys };
