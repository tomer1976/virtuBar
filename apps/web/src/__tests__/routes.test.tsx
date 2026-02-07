import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../app/providers/AuthProvider';
import { FeatureFlagsProvider } from '../app/providers/FeatureFlagsProvider';
import { ProfileProvider } from '../app/providers/ProfileProvider';
import { SettingsProvider } from '../app/providers/SettingsProvider';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';
import { AppRoutes, routePaths } from '../routes';

function renderWithRouter(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ErrorNotificationsProvider>
        <FeatureFlagsProvider>
          <SettingsProvider>
            <AuthProvider>
              <ProfileProvider>
                <AppRoutes />
              </ProfileProvider>
            </AuthProvider>
          </SettingsProvider>
        </FeatureFlagsProvider>
      </ErrorNotificationsProvider>
    </MemoryRouter>,
  );
}

describe('AppRoutes', () => {
  it('renders landing route', () => {
    renderWithRouter(routePaths.landing);
    expect(screen.getByText(/Landing/i)).toBeInTheDocument();
  });

  it('renders login route', () => {
    renderWithRouter(routePaths.login);
    expect(
      screen.getByRole('heading', {
        name: /Login/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  it('renders onboarding route', () => {
    renderWithRouter(routePaths.onboarding);
    expect(screen.getByText(/Onboarding/i)).toBeInTheDocument();
  });

  it('renders rooms route', () => {
    renderWithRouter(routePaths.rooms);
    expect(
      screen.getByRole('heading', {
        name: /Rooms/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  it('renders bar route with room id', () => {
    const roomId = 'demo-room';
    renderWithRouter(`/bar/${roomId}`);
    expect(screen.getByText(/Enter Bar/i)).toBeInTheDocument();
    const roomLabels = screen.getAllByText(new RegExp(roomId, 'i'));

    expect(roomLabels.length).toBeGreaterThan(0);
  });

  it('redirects unknown routes to landing', () => {
    renderWithRouter('/not-found');
    expect(screen.getByText(/Landing/i)).toBeInTheDocument();
  });
});
