import { fireEvent, render, screen } from '@testing-library/react';
import { AuthProvider } from '../app/providers/AuthProvider';
import { FeatureFlagsProvider } from '../app/providers/FeatureFlagsProvider';
import {
  PROFILE_STORAGE_KEY,
  ProfileProvider,
  defaultProfile,
} from '../app/providers/ProfileProvider';
import OnboardingPage from '../pages/OnboardingPage';

function renderPage() {
  return render(
    <FeatureFlagsProvider>
      <AuthProvider>
        <ProfileProvider>
          <OnboardingPage />
        </ProfileProvider>
      </AuthProvider>
    </FeatureFlagsProvider>,
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('walks through steps and saves profile to localStorage', () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/Display name/i), {
      target: { value: 'Party Starter' },
    });
    fireEvent.click(screen.getByText(/Save & Continue/i));

    fireEvent.click(screen.getByRole('button', { name: /neon/i }));
    fireEvent.click(screen.getByText(/Continue/i));

    fireEvent.click(screen.getByRole('button', { name: /Music/i }));
    fireEvent.click(screen.getByText(/Continue/i));

    fireEvent.click(screen.getByRole('button', { name: /Mark Audio Ready/i }));

    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = stored ? JSON.parse(stored) : defaultProfile;
    expect(parsed.displayName).toBe('Party Starter');
    expect(parsed.avatarPreset).toBe('neon');
    expect(parsed.interests).toContain('Music');
    expect(parsed.audioReady).toBe(true);
  });
});
