import { describe, expect, it } from 'vitest';
import { resolveRealtimeProviderKind } from '../net/realtime/providerFactory';

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
