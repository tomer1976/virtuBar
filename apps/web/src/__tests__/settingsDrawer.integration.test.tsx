import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';

describe('Settings drawer integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('opens settings drawer and persists toggle', () => {
    render(
      <ErrorNotificationsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorNotificationsProvider>,
    );

    fireEvent.click(screen.getByText(/Settings/i));
    fireEvent.click(screen.getByLabelText(/Mute audio/i));
    expect(screen.getByLabelText(/Mute audio/i)).toBeChecked();
    expect(window.localStorage.getItem('virtubar:settings')).toContain('audioMuted');
  });
});
