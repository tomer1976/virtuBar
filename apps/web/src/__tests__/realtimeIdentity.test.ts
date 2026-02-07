import { describe, expect, it } from 'vitest';
import { generateSessionUserId, getIdentityOverrideFromSearch, resolveRealtimeIdentity, resetRealtimeIdentity } from '../net/realtime/identity';
import { MockUser } from '../app/providers/AuthProvider';
import { MockProfile } from '../app/providers/ProfileProvider';

describe('realtime identity', () => {
  const profile: MockProfile = {
    displayName: 'Guest Mixer',
    avatarPreset: 'aurora',
    interests: [],
    ageConfirmed: false,
    audioPermission: 'idle',
    audioReady: false,
  };
  const user: MockUser = { id: 'u-1', name: 'Auth User', email: 'auth@test' };

  it('parses overrides from query string', () => {
    const override = getIdentityOverrideFromSearch('?rtUser=alice&rtName=Alice&rtAvatar=neon');
    expect(override).toEqual({ userId: 'alice', displayName: 'Alice', avatarId: 'neon' });
  });

  it('falls back to profile/auth data when override is absent', () => {
    const identity = resolveRealtimeIdentity(profile, user, { search: '' });
    expect(identity.displayName).toBe(profile.displayName);
    expect(identity.avatarId).toBe(profile.avatarPreset);
  });

  it('generates stable per-session ids when none are stored', () => {
    resetRealtimeIdentity();
    const first = resolveRealtimeIdentity(profile, user, { search: '' }).userId;
    const second = resolveRealtimeIdentity(profile, user, { search: '' }).userId;
    expect(first).toBe(second);
  });

  it('generates randomized ids when requested directly', () => {
    const id = generateSessionUserId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(3);
  });

  it('respects override even when session id exists', () => {
    resetRealtimeIdentity();
    const first = resolveRealtimeIdentity(profile, user, { search: '' }).userId;
    const overridden = resolveRealtimeIdentity(profile, user, { search: '?rtUser=override-me' }).userId;
    expect(overridden).toBe('override-me');
    expect(overridden).not.toBe(first);
  });
});
