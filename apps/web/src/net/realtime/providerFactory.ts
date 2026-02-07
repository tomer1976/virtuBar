import { createRateLimitedProvider } from './rateLimitedProvider';
import { createSimProvider } from './simProvider';
import { RealtimeProvider } from './types';

export type RealtimeProviderKind = 'sim' | 'ws';

export type RealtimeProviderOptions = {
  debug?: boolean;
  logEvents?: boolean;
};

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

function toBoolean(raw: unknown, defaultValue = false): boolean {
  if (raw === undefined || raw === null) return defaultValue;
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw !== 0;
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return defaultValue;
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  return defaultValue;
}

export function resolveRealtimeDebugOptions(env: Record<string, unknown>): RealtimeProviderOptions {
  return {
    debug: toBoolean(env.VITE_REALTIME_DEBUG, false),
    logEvents: toBoolean(env.VITE_REALTIME_LOG_EVENTS, false),
  };
}

export function createRealtimeProvider(kind: RealtimeProviderKind, options?: RealtimeProviderOptions): RealtimeProvider {
  const base = kind === 'sim' ? createSimProvider() : createSimProvider();
  if (kind === 'ws') {
    console.warn('REALTIME_PROVIDER=ws is not implemented yet; falling back to simulation provider');
  }

  const withLogging = options?.logEvents ? createLoggingProvider(base) : base;
  return createRateLimitedProvider(withLogging, { debug: options?.debug });
}

function createLoggingProvider(inner: RealtimeProvider): RealtimeProvider {
  const log = (message: string, details?: unknown) => {
    // eslint-disable-next-line no-console
    console.debug(`[realtime] ${message}`, details);
  };

  return {
    async connect() {
      log('connect');
      return inner.connect();
    },
    async disconnect() {
      log('disconnect');
      return inner.disconnect();
    },
    async joinRoom(payload) {
      log('join_room', { roomId: payload.roomId, userId: payload.user.userId, deviceType: payload.deviceType });
      return inner.joinRoom(payload);
    },
    async leaveRoom(roomId) {
      log('leave_room', { roomId });
      return inner.leaveRoom(roomId);
    },
    async sendTransform(payload) {
      log('avatar_transform', { roomId: payload.roomId, seq: payload.seq });
      return inner.sendTransform(payload);
    },
    async sendChat(payload) {
      log('local_chat', { roomId: payload.roomId, length: payload.text.length });
      return inner.sendChat(payload);
    },
    async sendEmote(payload) {
      log('emote', { roomId: payload.roomId, emoteId: payload.emoteId });
      return inner.sendEmote(payload);
    },
    on(event, handler) {
      const wrapped = (eventEnvelope: Parameters<typeof handler>[0]) => {
        log(`event:${eventEnvelope.t}`, { userId: (eventEnvelope.payload as { userId?: string }).userId });
        handler(eventEnvelope);
      };
      const unsubscribe = inner.on(event, wrapped);
      return () => unsubscribe();
    },
  };
}
