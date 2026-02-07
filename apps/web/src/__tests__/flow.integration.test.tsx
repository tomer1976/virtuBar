import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../App';
import ErrorBoundary from '../app/components/ErrorBoundary';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';
import { FeatureFlagsProvider } from '../app/providers/FeatureFlagsProvider';
import { ProfileProvider } from '../app/providers/ProfileProvider';
import { RealtimeClientProvider } from '../app/providers/RealtimeClientProvider';
import { RealtimeIdentityProvider } from '../app/providers/RealtimeIdentityProvider';
import { SettingsProvider } from '../app/providers/SettingsProvider';
import { AuthProvider } from '../app/providers/AuthProvider';
import BarPage from '../pages/BarPage';

const sendChatMock = vi.fn();

vi.mock('../app/providers/RealtimeRoomProvider', () => {
  const mockMembers = [
    { userId: 'alice', displayName: 'Alice', avatarId: 'aurora', x: 0, y: 0, z: 0, rotY: 0, anim: 'idle', speaking: false },
    { userId: 'bob', displayName: 'Bob', avatarId: 'ember', x: 1, y: 0, z: 1, rotY: 0, anim: 'idle', speaking: false },
  ];
  return {
    __esModule: true,
    RealtimeRoomProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useRealtimeRoom: () => ({
      roomId: 'room-cocktails-3',
      members: mockMembers,
      chats: [],
      sendChat: sendChatMock,
      sendTransform: vi.fn(),
    }),
  };
});

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ErrorNotificationsProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ErrorNotificationsProvider>
    </MemoryRouter>,
  );
}

describe('End-to-end UI flow', () => {
  it('completes onboarding, joins a room, and performs HUD interactions', async () => {
    sendChatMock.mockClear();
    const initial = renderApp('/onboarding');

    fireEvent.change(screen.getByLabelText(/Display name/i), { target: { value: 'Demo User' } });
    fireEvent.click(screen.getByLabelText(/Confirm legal age/i));
    fireEvent.click(screen.getByRole('button', { name: /Save & Continue/i }));

    fireEvent.click(screen.getByRole('button', { name: /aurora/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    const interests = ['Music', 'Karaoke', 'VR', 'Cocktails', 'Live DJ'];
    interests.forEach((label) => fireEvent.click(screen.getByRole('button', { name: label })));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    fireEvent.click(screen.getByRole('button', { name: /Request mic access/i }));
    fireEvent.click(screen.getByRole('button', { name: /Allow \(mock\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mark Audio Ready/i }));
    expect(await screen.findByText(/Audio check saved/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /Rooms/i }));
    expect(await screen.findByRole('heading', { name: /Rooms/i, level: 2 })).toBeInTheDocument();

    const joinLink = screen.getByRole('link', { name: /Join hottest room/i });
    const joinHref = joinLink.getAttribute('href') ?? '/bar/demo-room';

    initial.unmount();
    render(
      <MemoryRouter initialEntries={[joinHref]}>
        <ErrorNotificationsProvider>
          <FeatureFlagsProvider>
            <SettingsProvider>
              <AuthProvider>
                <ProfileProvider>
                  <RealtimeClientProvider>
                    <RealtimeIdentityProvider>
                      <Routes>
                        <Route path="/bar/:roomId" element={<BarPage />} />
                      </Routes>
                    </RealtimeIdentityProvider>
                  </RealtimeClientProvider>
                </ProfileProvider>
              </AuthProvider>
            </SettingsProvider>
          </FeatureFlagsProvider>
        </ErrorNotificationsProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: /Enter Bar/i, level: 2 })).toBeInTheDocument();

    const chatInput = screen.getByLabelText(/Type a message/i);
    fireEvent.change(chatInput, { target: { value: 'Integration hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    expect(sendChatMock).toHaveBeenCalledWith('Integration hello');

    const firstNearby = await screen.findByTestId('nearby-0');
    fireEvent.click(firstNearby);
    fireEvent.click(screen.getByRole('button', { name: /report user/i }));
    expect(within(firstNearby).getByText(/Reported/i)).toBeInTheDocument();
  });
});