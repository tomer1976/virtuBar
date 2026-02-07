import { fireEvent, render, screen } from '@testing-library/react';
import { AuthProvider } from '../app/providers/AuthProvider';
import { FeatureFlagsProvider } from '../app/providers/FeatureFlagsProvider';
import {
  PROFILE_STORAGE_KEY,
  ProfileProvider,
  defaultProfile,
} from '../app/providers/ProfileProvider';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';
import OnboardingPage from '../pages/OnboardingPage';

function renderPage() {
  return render(
    <ErrorNotificationsProvider>
      <FeatureFlagsProvider>
        <AuthProvider>
          <ProfileProvider>
            <OnboardingPage />
          </ProfileProvider>
        </AuthProvider>
      </FeatureFlagsProvider>
    </ErrorNotificationsProvider>,
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('enforces age gate, interest minimum, and audio permission before completion', () => {
    renderPage();

    const saveIdentity = screen.getByRole('button', { name: /Save & Continue/i });
    expect(saveIdentity).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Display name/i), {
      target: { value: 'Party Starter' },
    });
    expect(saveIdentity).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/Confirm legal age/i));
    expect(saveIdentity).toBeEnabled();
    fireEvent.click(saveIdentity);

    fireEvent.click(screen.getByRole('button', { name: /neon/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

    const continueInterests = screen.getByRole('button', { name: /^Continue$/i });
    expect(continueInterests).toBeDisabled();
    ['Music', 'Karaoke', 'VR', 'Cocktails', 'Live DJ'].forEach((interest) => {
      fireEvent.click(screen.getByRole('button', { name: interest }));
    });
    expect(continueInterests).toBeEnabled();
    fireEvent.click(continueInterests);

    fireEvent.click(screen.getByRole('button', { name: /Request mic access/i }));
    fireEvent.click(screen.getByRole('button', { name: /Allow \(mock\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mark Audio Ready/i }));

    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = stored ? JSON.parse(stored) : defaultProfile;
    expect(parsed.displayName).toBe('Party Starter');
    expect(parsed.avatarPreset).toBe('neon');
    expect(parsed.ageConfirmed).toBe(true);
    expect(parsed.interests.length).toBeGreaterThanOrEqual(5);
    expect(parsed.audioPermission).toBe('granted');
    expect(parsed.audioReady).toBe(true);
  });
});
