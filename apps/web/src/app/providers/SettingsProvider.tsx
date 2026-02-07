import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useErrorNotifications } from './ErrorNotificationsProvider';
import { clearStorageKey, readJsonWithDefaults, writeJsonSafe } from '../utils/storage';

export type Settings = {
  audioMuted: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  motionReduction: boolean;
  showJoystick: boolean;
  invertYAxis: boolean;
};

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
};

const STORAGE_KEY = 'virtubar:settings';
const defaultSettings: Settings = {
  audioMuted: false,
  graphicsQuality: 'high',
  motionReduction: false,
  showJoystick: true,
  invertYAxis: false,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
  const { notifyError } = useErrorNotifications();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const stored = readJsonWithDefaults<Settings>(STORAGE_KEY, defaultSettings, notifyError);
    setSettings(stored);
  }, [notifyError]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      writeJsonSafe(STORAGE_KEY, next, notifyError);
      return next;
    });
  }, [notifyError]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    clearStorageKey(STORAGE_KEY, notifyError);
  }, [notifyError]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, resetSettings }),
    [resetSettings, settings, updateSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

export { defaultSettings, STORAGE_KEY as SETTINGS_STORAGE_KEY };
