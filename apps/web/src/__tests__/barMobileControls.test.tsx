import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MutableRefObject } from 'react';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';
import { FeatureFlagsProvider } from '../app/providers/FeatureFlagsProvider';
import { ProfileProvider } from '../app/providers/ProfileProvider';
import { RealtimeClientProvider } from '../app/providers/RealtimeClientProvider';
import { RealtimeIdentityProvider } from '../app/providers/RealtimeIdentityProvider';
import { SettingsProvider } from '../app/providers/SettingsProvider';
import BarPage from '../pages/BarPage';

type SceneProps = {
  mobileMoveRef: MutableRefObject<{ x: number; z: number }>;
  mobileLookDeltaRef: MutableRefObject<{ dx: number; dy: number }>;
};

let lastSceneProps: SceneProps | null = null;

vi.mock('../three/SceneRoot', () => {
  const MockScene = (props: SceneProps) => {
    lastSceneProps = props;
    return <div data-testid="mock-scene-root" />;
  };
  return { __esModule: true, default: MockScene };
});

describe('BarPage mobile controls', () => {
  beforeEach(() => {
    lastSceneProps = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderBar = () => {
    return render(
      <ErrorNotificationsProvider>
        <FeatureFlagsProvider>
          <SettingsProvider>
            <ProfileProvider>
              <RealtimeClientProvider>
                <RealtimeIdentityProvider>
                  <MemoryRouter initialEntries={[{ pathname: '/bar/room-1' }]}>
                    <Routes>
                      <Route path="/bar/:roomId" element={<BarPage />} />
                    </Routes>
                  </MemoryRouter>
                </RealtimeIdentityProvider>
              </RealtimeClientProvider>
            </ProfileProvider>
          </SettingsProvider>
        </FeatureFlagsProvider>
      </ErrorNotificationsProvider>,
    );
  };

  it('shows joystick overlay and sends move/look to SceneRoot refs', () => {
    renderBar();

    const movePad = screen.getByLabelText(/Move pad/i) as HTMLDivElement;
    const lookPad = screen.getByLabelText(/Look pad/i) as HTMLDivElement;

    Object.defineProperty(movePad, 'getBoundingClientRect', {
      value: () => ({ width: 140, height: 140, left: 0, top: 0, right: 140, bottom: 140, x: 0, y: 0, toJSON: () => {} }),
    });
    Object.defineProperty(lookPad, 'getBoundingClientRect', {
      value: () => ({ width: 140, height: 140, left: 0, top: 0, right: 140, bottom: 140, x: 0, y: 0, toJSON: () => {} }),
    });

    fireEvent.pointerDown(movePad, { clientX: 70, clientY: 70 });
    fireEvent.pointerMove(movePad, { clientX: 110, clientY: 70 });
    fireEvent.pointerUp(movePad, { clientX: 110, clientY: 70 });

    const propsAfterMove = lastSceneProps;
    expect(propsAfterMove?.mobileMoveRef?.current.x).not.toBeUndefined();
    expect(propsAfterMove?.mobileMoveRef?.current.z).not.toBeUndefined();

    fireEvent.pointerDown(lookPad, { clientX: 70, clientY: 70 });
    fireEvent.pointerMove(lookPad, { clientX: 90, clientY: 80 });
    fireEvent.pointerUp(lookPad, { clientX: 90, clientY: 80 });

    const propsAfterLook = lastSceneProps;
    expect(propsAfterLook?.mobileLookDeltaRef?.current.dx).not.toBeUndefined();
    expect(propsAfterLook?.mobileLookDeltaRef?.current.dy).not.toBeUndefined();
  });
});
