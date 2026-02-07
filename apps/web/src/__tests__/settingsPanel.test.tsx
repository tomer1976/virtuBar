import { fireEvent, render, screen } from '@testing-library/react';
import SettingsPanel from '../app/components/SettingsPanel';
import { SettingsProvider, SETTINGS_STORAGE_KEY } from '../app/providers/SettingsProvider';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';

function renderPanel(open = true) {
  return render(
    <ErrorNotificationsProvider>
      <SettingsProvider>
        <SettingsPanel open={open} onClose={() => {}} />
      </SettingsProvider>
    </ErrorNotificationsProvider>,
  );
}

describe('SettingsPanel', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('toggles audio mute and persists', () => {
    renderPanel();
    fireEvent.click(screen.getByLabelText(/Mute audio/i));
    expect(screen.getByLabelText(/Mute audio/i)).toBeChecked();
    expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).toContain('audioMuted');
  });

  it('changes graphics quality', () => {
    renderPanel();
    fireEvent.click(screen.getByLabelText(/Medium/i));
    expect(screen.getByLabelText(/Medium/i)).toBeChecked();
  });

  it('persists control toggles across reload', () => {
    const { unmount } = renderPanel();

    const joystick = screen.getByLabelText(/Show joystick overlay/i) as HTMLInputElement;
    const invert = screen.getByLabelText(/Invert Y axis/i) as HTMLInputElement;

    const nextJoystick = !joystick.checked;
    fireEvent.click(joystick);
    fireEvent.click(invert);

    expect((screen.getByLabelText(/Show joystick overlay/i) as HTMLInputElement).checked).toBe(nextJoystick);
    expect(screen.getByLabelText(/Invert Y axis/i)).toBeChecked();

    unmount();

    renderPanel();
    expect((screen.getByLabelText(/Show joystick overlay/i) as HTMLInputElement).checked).toBe(nextJoystick);
    expect(screen.getByLabelText(/Invert Y axis/i)).toBeChecked();
  });

  it('persists audio, motion, and graphics settings across reload', () => {
    const { unmount } = renderPanel();

    const mute = screen.getByLabelText(/Mute audio/i) as HTMLInputElement;
    const motion = screen.getByLabelText(/Reduce motion/i) as HTMLInputElement;
    const low = screen.getByLabelText(/Low/i) as HTMLInputElement;

    fireEvent.click(mute);
    fireEvent.click(motion);
    fireEvent.click(low);

    expect(mute).toBeChecked();
    expect(motion).toBeChecked();
    expect(low).toBeChecked();

    unmount();

    renderPanel();
    expect(screen.getByLabelText(/Mute audio/i)).toBeChecked();
    expect(screen.getByLabelText(/Reduce motion/i)).toBeChecked();
    expect(screen.getByLabelText(/Low/i)).toBeChecked();
  });
});
