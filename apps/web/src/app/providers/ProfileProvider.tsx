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

export type MockProfile = {
  displayName: string;
  avatarPreset: string;
  interests: string[];
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
  audioReady: false,
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function readStoredProfile(onError?: (message: string) => void): MockProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockProfile;
    if (parsed && typeof parsed.displayName === 'string') {
      return { ...defaultProfile, ...parsed };
    }
  } catch (error) {
    onError?.('Profile data could not be loaded; defaults restored.');
    console.warn('Failed to parse stored mock profile', error);
  }
  return null;
}

function writeStoredProfile(profile: MockProfile, onError?: (message: string) => void) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    onError?.('Profile changes could not be saved.');
    console.warn('Failed to write mock profile', error);
  }
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
    if (flags.USE_MOCK_PROFILE && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        notifyError('Profile could not be cleared.');
        console.warn('Failed to clear profile', error);
      }
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
