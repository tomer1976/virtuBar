import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';
import { FeatureFlagsProvider } from '../app/providers/FeatureFlagsProvider';
import { SettingsProvider } from '../app/providers/SettingsProvider';
import { generateNearbyUsers } from '../state/mockNearby';
import BarPage from '../pages/BarPage';

let lastOnSelectProfile: ((user: unknown) => void) | null = null;

vi.mock('../three/SceneRoot', () => {
  return {
    __esModule: true,
    default: (props: { onSelectProfile: (user: unknown) => void }) => {
      lastOnSelectProfile = props.onSelectProfile;
      return <div data-testid="mock-scene-root" />;
    },
  };
});

vi.mock('../app/providers/ProfileProvider', () => {
  const profile = {
    displayName: 'Player One',
    avatarPreset: 'aurora',
    interests: ['mixology', 'vinyl'],
    ageConfirmed: true,
    audioPermission: 'granted',
    audioReady: true,
  };
  return {
    __esModule: true,
    useProfile: () => ({ profile, updateProfile: vi.fn(), resetProfile: vi.fn() }),
    ProfileProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('BarPage profile selection', () => {
  beforeEach(() => {
    lastOnSelectProfile = null;
  });

  const renderBar = () =>
    render(
      <ErrorNotificationsProvider>
        <FeatureFlagsProvider>
          <SettingsProvider>
            <MemoryRouter initialEntries={[{ pathname: '/bar/room-1' }]}>
              <Routes>
                <Route path="/bar/:roomId" element={<BarPage />} />
              </Routes>
            </MemoryRouter>
          </SettingsProvider>
        </FeatureFlagsProvider>
      </ErrorNotificationsProvider>,
    );

  it('opens overlay for NPC and player selections', async () => {
    renderBar();
    expect(lastOnSelectProfile).not.toBeNull();

    const npcProfiles = generateNearbyUsers({ seed: 'room-1', count: 22 });
    await act(async () => {
      lastOnSelectProfile?.(npcProfiles[0]);
    });
    const npcMatches = await screen.findAllByText(npcProfiles[0].displayName);
    expect(npcMatches.length).toBeGreaterThan(0);

    await act(async () => {
      lastOnSelectProfile?.({
        id: 'player',
        displayName: 'Player One',
        avatarPreset: 'aurora',
        sharedInterests: ['mixology'],
        region: 'Local',
        affinityScore: 100,
      });
    });
    const playerMatches = await screen.findAllByText('Player One');
    expect(playerMatches.length).toBeGreaterThan(0);
  });
});
