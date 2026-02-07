import { describe, expect, it } from 'vitest';
import { resolveRealtimeDebugOptions, resolveRealtimeProviderKind } from '../net/realtime/providerFactory';

describe('resolveRealtimeProviderKind', () => {
  it('defaults to sim when no env is set', () => {
    expect(resolveRealtimeProviderKind({})).toBe('sim');
  });

  it('normalizes ws selection', () => {
    expect(resolveRealtimeProviderKind({ VITE_REALTIME_PROVIDER: 'ws' })).toBe('ws');
    expect(resolveRealtimeProviderKind({ VITE_REALTIME_PROVIDER: ' WS ' })).toBe('ws');
  });

  it('falls back to sim for unknown values', () => {
    expect(resolveRealtimeProviderKind({ VITE_REALTIME_PROVIDER: 'invalid' })).toBe('sim');
  });

  it('forces sim when feature flags request mocks', () => {
    expect(resolveRealtimeProviderKind({ VITE_REALTIME_PROVIDER: 'ws' }, { forceSim: true })).toBe('sim');
  });
});

describe('resolveRealtimeDebugOptions', () => {
  it('returns false when unset', () => {
    expect(resolveRealtimeDebugOptions({})).toEqual({ debug: false, logEvents: false });
  });

  it('parses truthy string values', () => {
    expect(resolveRealtimeDebugOptions({ VITE_REALTIME_DEBUG: '1', VITE_REALTIME_LOG_EVENTS: 'true' })).toEqual({
      debug: true,
      logEvents: true,
    });
  });

  it('parses falsy string values', () => {
    expect(resolveRealtimeDebugOptions({ VITE_REALTIME_DEBUG: '0', VITE_REALTIME_LOG_EVENTS: 'off' })).toEqual({
      debug: false,
      logEvents: false,
    });
  });
});
