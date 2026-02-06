import { renderHook, act } from '@testing-library/react';
import { FeatureFlagsProvider } from '../app/providers/FeatureFlagsProvider';
import {
  defaultProfile,
  PROFILE_STORAGE_KEY,
  ProfileProvider,
  useProfile,
} from '../app/providers/ProfileProvider';

function renderProfileHook() {
  return renderHook(() => useProfile(), {
    wrapper: ({ children }) => (
      <FeatureFlagsProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </FeatureFlagsProvider>
    ),
  });
}

describe('ProfileProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hydrates from localStorage', () => {
    const stored = { ...defaultProfile, displayName: 'Persisted User' };
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(stored));
    const { result } = renderProfileHook();
    expect(result.current.profile.displayName).toBe('Persisted User');
  });

  it('updates and persists profile fields', () => {
    const { result } = renderProfileHook();
    act(() => {
      result.current.updateProfile({ displayName: 'Bar Hopper', interests: ['Music'] });
    });

    expect(result.current.profile.displayName).toBe('Bar Hopper');
    expect(result.current.profile.interests).toContain('Music');
    expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).toContain('Bar Hopper');
  });

  it('resets profile and clears storage', () => {
    const { result } = renderProfileHook();
    act(() => {
      result.current.updateProfile({ displayName: 'Temp' });
    });
    act(() => {
      result.current.resetProfile();
    });
    expect(result.current.profile.displayName).toBe(defaultProfile.displayName);
    expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
  });
});
