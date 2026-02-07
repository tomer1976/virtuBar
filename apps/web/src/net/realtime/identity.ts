import { MockUser } from '../../app/providers/AuthProvider';
import { MockProfile } from '../../app/providers/ProfileProvider';
import { RealtimeUserIdentity } from './types';

const SESSION_KEY = 'virtubar:rt:session-user';

function safeSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn('Realtime identity: sessionStorage unavailable', error);
    return null;
  }
}

function readSessionId(): string | null {
  const store = safeSessionStorage();
  if (!store) return null;
  try {
    const stored = store.getItem(SESSION_KEY);
    if (stored) return stored;
  } catch (error) {
    console.warn('Realtime identity: failed to read session id', error);
  }
  return null;
}

function writeSessionId(id: string): void {
  const store = safeSessionStorage();
  if (!store) return;
  try {
    store.setItem(SESSION_KEY, id);
  } catch (error) {
    console.warn('Realtime identity: failed to write session id', error);
  }
}

export function generateSessionUserId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `rt-${Math.random().toString(16).slice(2, 10)}`;
}

export function getIdentityOverrideFromSearch(search: string): Partial<RealtimeUserIdentity> {
  const params = new URLSearchParams(search || '');
  const userId = params.get('rtUser') ?? params.get('rtUserId');
  const displayName = params.get('rtName') ?? undefined;
  const avatarId = params.get('rtAvatar') ?? undefined;
  const override: Partial<RealtimeUserIdentity> = {};
  if (userId) override.userId = userId;
  if (displayName) override.displayName = displayName;
  if (avatarId) override.avatarId = avatarId;
  return override;
}

export function resolveRealtimeIdentity(
  profile: MockProfile,
  authUser: MockUser | null,
  options?: { search?: string },
): RealtimeUserIdentity {
  const override = getIdentityOverrideFromSearch(options?.search ?? (typeof window !== 'undefined' ? window.location.search : ''));
  const persistedId = override.userId ?? readSessionId() ?? generateSessionUserId();
  if (!override.userId) {
    writeSessionId(persistedId);
  }

  const displayName = override.displayName || profile.displayName || authUser?.name || 'Guest User';
  const avatarId = override.avatarId || profile.avatarPreset || 'aurora';

  return {
    userId: persistedId,
    displayName,
    avatarId,
  };
}

export function resetRealtimeIdentity(): void {
  const store = safeSessionStorage();
  try {
    store?.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn('Realtime identity: failed to clear session id', error);
  }
}

export { SESSION_KEY as REALTIME_ID_SESSION_KEY };
