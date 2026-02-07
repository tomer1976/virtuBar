import { fireEvent, render, screen } from '@testing-library/react';
import SettingsPanel from '../app/components/SettingsPanel';
import { SettingsProvider, SETTINGS_STORAGE_KEY } from '../app/providers/SettingsProvider';

function renderPanel(open = true) {
  return render(
    <SettingsProvider>
      <SettingsPanel open={open} onClose={() => {}} />
    </SettingsProvider>,
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
});
