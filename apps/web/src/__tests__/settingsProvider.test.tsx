import { renderHook, act } from '@testing-library/react';
import {
  defaultSettings,
  SETTINGS_STORAGE_KEY,
  SettingsProvider,
  useSettings,
} from '../app/providers/SettingsProvider';

function renderSettingsHook() {
  return renderHook(() => useSettings(), {
    wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>,
  });
}

describe('SettingsProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hydrates from localStorage', () => {
    const stored = { ...defaultSettings, audioMuted: true };
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(stored));
    const { result } = renderSettingsHook();
    expect(result.current.settings.audioMuted).toBe(true);
  });

  it('updates and persists settings', () => {
    const { result } = renderSettingsHook();
    act(() => {
      result.current.updateSettings({ graphicsQuality: 'low' });
    });
    expect(result.current.settings.graphicsQuality).toBe('low');
    expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).toContain('low');
  });

  it('resets settings and clears storage', () => {
    const { result } = renderSettingsHook();
    act(() => {
      result.current.updateSettings({ audioMuted: true });
    });
    act(() => {
      result.current.resetSettings();
    });
    expect(result.current.settings).toEqual(defaultSettings);
    expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });
});
