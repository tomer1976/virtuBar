import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useFeatureFlags } from './FeatureFlagsProvider';
import { useErrorNotifications } from './ErrorNotificationsProvider';
import { clearStorageKey, readJsonWithDefaults, writeJsonSafe } from '../utils/storage';

export type MockProfile = {
  displayName: string;
  avatarPreset: string;
  interests: string[];
  ageConfirmed: boolean;
  audioPermission: 'idle' | 'prompting' | 'granted' | 'denied';
  audioReady: boolean;
};

type ProfileContextValue = {
  profile: MockProfile;
  updateProfile: (partial: Partial<MockProfile>) => void;
  resetProfile: () => void;
};

const STORAGE_KEY = 'virtubar:profile';
const defaultProfile: MockProfile = {
  displayName: 'Guest Mixer',
  avatarPreset: 'aurora',
  interests: [],
  ageConfirmed: false,
  audioPermission: 'idle',
  audioReady: false,
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function readStoredProfile(onError?: (message: string) => void): MockProfile | null {
  const merged = readJsonWithDefaults<MockProfile>(STORAGE_KEY, defaultProfile, onError);
  if (merged.displayName) return merged;
  return null;
}

function writeStoredProfile(profile: MockProfile, onError?: (message: string) => void) {
  writeJsonSafe(STORAGE_KEY, profile, onError);
}

export function ProfileProvider({ children }: PropsWithChildren) {
  const flags = useFeatureFlags();
  const { notifyError } = useErrorNotifications();
  const [profile, setProfile] = useState<MockProfile>(defaultProfile);

  useEffect(() => {
    if (!flags.USE_MOCK_PROFILE) return;
    const stored = readStoredProfile(notifyError);
    if (stored) {
      setProfile(stored);
    }
  }, [flags.USE_MOCK_PROFILE, notifyError]);

  const updateProfile = useCallback(
    (partial: Partial<MockProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...partial };
        if (flags.USE_MOCK_PROFILE) {
          writeStoredProfile(next, notifyError);
        }
        return next;
      });
    },
    [flags.USE_MOCK_PROFILE, notifyError],
  );

  const resetProfile = useCallback(() => {
    setProfile(defaultProfile);
    if (flags.USE_MOCK_PROFILE) {
      clearStorageKey(STORAGE_KEY, notifyError);
    }
  }, [flags.USE_MOCK_PROFILE, notifyError]);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, updateProfile, resetProfile }),
    [profile, resetProfile, updateProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}

export { defaultProfile, STORAGE_KEY as PROFILE_STORAGE_KEY };
