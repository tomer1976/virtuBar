import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Settings = {
  audioMuted: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  motionReduction: boolean;
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
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readStoredSettings(): Settings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Settings;
    if (parsed && typeof parsed.graphicsQuality === 'string') {
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to parse stored settings', error);
  }
  return null;
}

function writeStoredSettings(settings: Settings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to write settings', error);
  }
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const stored = readStoredSettings();
    if (stored) {
      setSettings(stored);
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      writeStoredSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

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
